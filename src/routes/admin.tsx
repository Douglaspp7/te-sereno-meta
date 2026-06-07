import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Trash2, ShieldCheck, Lock, RefreshCcw } from 'lucide-react'
import { getAllowlist, deleteAllowlistEmail } from '@/lib/admin.functions'
import { useServerFn } from '@tanstack/start'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  const fetchListFn = useServerFn(getAllowlist)
  const deleteFn = useServerFn(deleteAllowlistEmail)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '517243') {
      setIsAuthenticated(true)
      loadData()
    } else {
      alert('Senha incorreta')
    }
  }

  const loadData = async () => {
    setRefreshing(true)
    try {
      const data = await fetchListFn()
      setEmails(data || [])
    } catch (err) {
      console.error(err)
      alert("Erro ao carregar dados")
    }
    setRefreshing(false)
  }

  const handleDelete = async (email: string) => {
    if (!confirm(`Tem certeza que deseja apagar o acesso de ${email}?`)) return;
    setLoading(true)
    try {
      await deleteFn({ data: email })
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Erro ao deletar")
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-sm w-full backdrop-blur-xl">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-6">Painel Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha secreta"
            className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white mb-4 focus:border-emerald-500 outline-none"
          />
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors">
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold">Acessos Liberados</h1>
          </div>
          <button onClick={loadData} disabled={refreshing} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin text-emerald-500' : 'text-white/60'}`} />
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-white/50">Nenhum comprador encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-4 font-medium text-white/60">E-mail</th>
                    <th className="p-4 font-medium text-white/60">Status</th>
                    <th className="p-4 font-medium text-white/60">Data</th>
                    <th className="p-4 font-medium text-right text-white/60">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{row.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {row.status || 'active'}
                        </span>
                      </td>
                      <td className="p-4 text-white/50 text-sm">
                        {new Date(row.created_at || row.purchased_at || Date.now()).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(row.email)}
                          disabled={loading}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

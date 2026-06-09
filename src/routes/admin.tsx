import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Trash2, ShieldCheck, Lock, RefreshCcw, Key, BarChart3, Users } from "lucide-react";

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

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
      const res = await fetch('/api/admin/allowlist')
      const data = await res.json()
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
      await fetch('/api/admin/allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Erro ao deletar")
    }
    setLoading(false)
  }

  const handleResetPassword = async (email: string) => {
    if (!confirm(`Tem certeza que deseja resetar a senha de ${email} para 'mireto2026'?`)) return;
    setLoading(true)
    try {
      const res = await fetch('/api/admin/allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'reset_password' })
      })
      const data = await res.json()
      if (data.error) {
        alert("Erro: " + data.error)
      } else {
        alert("Senha redefinida com sucesso para: mireto2026")
      }
    } catch (err) {
      console.error(err)
      alert("Erro ao redefinir senha")
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold">Painel Admin</h1>
          </div>
          <button onClick={loadData} disabled={refreshing} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin text-emerald-500' : 'text-white/60'}`} />
          </button>
        </div>

        <AdminTabs
          emails={emails}
          loading={loading}
          handleDelete={handleDelete}
          handleResetPassword={handleResetPassword}
        />
      </div>
    </div>
  )
}

function AdminTabs({ emails, loading, handleDelete, handleResetPassword }: {
  emails: any[]; loading: boolean;
  handleDelete: (e: string) => void;
  handleResetPassword: (e: string) => void;
}) {
  const [tab, setTab] = useState<'access' | 'funnel'>('funnel');
  return (
    <>
      <div className="flex gap-2 mb-8 border-b border-white/10">
        <button
          onClick={() => setTab('funnel')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${tab === 'funnel' ? 'text-emerald-400 border-emerald-400' : 'text-white/60 border-transparent hover:text-white'}`}
        >
          <BarChart3 className="w-4 h-4" /> Funil
        </button>
        <button
          onClick={() => setTab('access')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${tab === 'access' ? 'text-emerald-400 border-emerald-400' : 'text-white/60 border-transparent hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Acessos
        </button>
      </div>

      {tab === 'funnel'
        ? <FunnelPanel />
        : <AccessTable emails={emails} loading={loading} handleDelete={handleDelete} handleResetPassword={handleResetPassword} />}
    </>
  );
}

function AccessTable({ emails, loading, handleDelete, handleResetPassword }: {
  emails: any[]; loading: boolean;
  handleDelete: (e: string) => void;
  handleResetPassword: (e: string) => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
      {emails.length === 0 ? (
        <div className="p-8 text-center text-white/50">Nenhum comprador encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium text-white/60">E-mail</th>
                <th className="p-4 font-medium text-white/60">Telefone</th>
                <th className="p-4 font-medium text-white/60">Status</th>
                <th className="p-4 font-medium text-white/60">Data</th>
                <th className="p-4 font-medium text-right text-white/60">Ações</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{row.buyer_email || row.email}</td>
                  <td className="p-4 text-white/70">{row.phone || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : row.status === 'approved' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                      {row.status || 'active'}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm">
                    {new Date(row.created_at || row.purchased_at || Date.now()).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {row.source === 'profiles' && (
                      <button
                        onClick={() => handleResetPassword(row.buyer_email || row.email)}
                        disabled={loading}
                        title="Resetar senha para mireto2026"
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(row.buyer_email || row.email)}
                      disabled={loading}
                      title="Revogar acesso"
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
  );
}

const FUNNEL_EVENTS: { key: string; label: string }[] = [
  { key: 'QuizView', label: 'Quiz View' },
  { key: 'QuizStart', label: 'Quiz Start' },
  { key: 'QuizComplete', label: 'Quiz Complete' },
  { key: 'VSLView', label: 'VSL View' },
  { key: 'VSL75', label: 'VSL 75%' },
  { key: 'OfferView', label: 'Offer View' },
  { key: 'InitiateCheckout', label: 'Initiate Checkout' },
  { key: 'Purchase', label: 'Purchase' },
];

function FunnelPanel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?days=${days}`);
      setData(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  if (!data) {
    return <div className="text-white/60 p-8 text-center">{loading ? 'Carregando…' : 'Sem dados.'}</div>;
  }

  const total = data.totalCounts || {};
  const unique = data.uniqueCounts || {};
  const conv = data.conversions || {};
  const baseline = unique.QuizView || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-sm">Período:</span>
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === d ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          >
            {d}d
          </button>
        ))}
        <button onClick={load} disabled={loading} className="ml-auto p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : 'text-white/60'}`} />
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium text-white/60">Evento</th>
              <th className="p-4 font-medium text-white/60 text-right">Total</th>
              <th className="p-4 font-medium text-white/60 text-right">Únicos (sessões)</th>
              <th className="p-4 font-medium text-white/60 text-right">% do topo</th>
            </tr>
          </thead>
          <tbody>
            {FUNNEL_EVENTS.map(e => {
              const u = unique[e.key] || 0;
              const pct = baseline > 0 ? ((u / baseline) * 100).toFixed(1) : '—';
              return (
                <tr key={e.key} className="border-b border-white/5">
                  <td className="p-4 font-medium">{e.label}</td>
                  <td className="p-4 text-right text-white/80">{total[e.key] || 0}</td>
                  <td className="p-4 text-right text-emerald-400 font-bold">{u}</td>
                  <td className="p-4 text-right text-white/60">{pct === '—' ? '—' : `${pct}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Quiz Start / View" value={conv.quizStartRate} />
        <Metric label="Quiz Complete / Start" value={conv.quizCompleteRate} />
        <Metric label="VSL View / Complete" value={conv.vslViewRate} />
        <Metric label="VSL 75% / View" value={conv.vsl75Rate} />
        <Metric label="Offer View / Quiz View" value={conv.offerViewRate} />
        <Metric label="Checkout / Offer View" value={conv.checkoutRate} />
        <Metric label="Purchase / Checkout" value={conv.purchaseRate} highlight />
        <Metric label="Purchase / Quiz View" value={conv.overall} highlight />
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-md ${highlight ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'}`}>
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value ?? 0}%</div>
    </div>
  );
}

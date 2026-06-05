import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { ArrowLeft, Maximize, Minimize, Download } from "lucide-react";
import { academiaDocuments } from "@/data/academia";

export const Route = createFileRoute("/_authenticated/academia/read/$docId")({
  component: PdfReaderRoute,
});

function PdfReaderRoute() {
  const navigate = useNavigate();
  const { docId } = Route.useParams();
  const documentInfo = academiaDocuments.find(d => d.id === docId);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!documentInfo) return <div className="p-8 text-center">Documento no encontrado</div>;

  return (
    <div ref={containerRef} className={`flex flex-col bg-[#EFEFEF] ${isFullscreen ? 'h-screen' : 'h-[100dvh]'}`}>
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate({ to: "/academia" })}
            className="p-2 rounded-full bg-secondary text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{documentInfo.category}</span>
            <span className="text-sm font-bold text-foreground line-clamp-1">{documentInfo.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={documentInfo.pdfUrl} 
            download 
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full text-foreground/70 hover:bg-secondary flex items-center gap-1"
            title="Descargar PDF"
          >
            <Download className="h-5 w-5" />
          </a>
          <button onClick={toggleFullscreen} className="p-2 rounded-full text-foreground/70 hover:bg-secondary hidden md:block">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 overflow-hidden relative">
        <iframe 
          src={`${documentInfo.pdfUrl}#toolbar=0&view=FitH`} 
          className="absolute inset-0 w-full h-full border-none"
          title={documentInfo.title}
        />
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { academiaDocuments } from "@/data/academia";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const Route = createFileRoute("/_authenticated/academia/read/$docId")({
  component: PdfReaderRoute,
});

function PdfReaderRoute() {
  const navigate = useNavigate();
  const { docId } = Route.useParams();
  const documentInfo = academiaDocuments.find(d => d.id === docId);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load progress
  useEffect(() => {
    const savedProgressStr = localStorage.getItem('academia_pages');
    if (savedProgressStr) {
      const savedProgress = JSON.parse(savedProgressStr);
      if (savedProgress[docId]) {
        setPageNumber(savedProgress[docId]);
      }
    }
  }, [docId]);

  // Save progress automatically
  useEffect(() => {
    if (numPages) {
      const percentage = (pageNumber / numPages) * 100;
      
      // Save global percentage
      const progressObj = JSON.parse(localStorage.getItem('academia_progress') || '{}');
      progressObj[docId] = percentage;
      localStorage.setItem('academia_progress', JSON.stringify(progressObj));
      
      // Save exact page
      const pagesObj = JSON.parse(localStorage.getItem('academia_pages') || '{}');
      pagesObj[docId] = pageNumber;
      localStorage.setItem('academia_pages', JSON.stringify(pagesObj));
    }
  }, [pageNumber, numPages, docId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 2.5));
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextPage = () => setPageNumber(p => Math.min(p + 1, numPages || 1));
  const prevPage = () => setPageNumber(p => Math.max(p - 1, 1));

  if (!documentInfo) return <div className="p-8 text-center">Documento no encontrado</div>;

  return (
    <div ref={containerRef} className={`flex flex-col bg-[#EFEFEF] ${isFullscreen ? 'h-screen' : 'min-h-screen'}`}>
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
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
          <button onClick={zoomOut} className="p-2 rounded-full text-foreground/70 hover:bg-secondary"><ZoomOut className="h-5 w-5" /></button>
          <button onClick={zoomIn} className="p-2 rounded-full text-foreground/70 hover:bg-secondary"><ZoomIn className="h-5 w-5" /></button>
          <button onClick={toggleFullscreen} className="p-2 rounded-full text-foreground/70 hover:bg-secondary hidden md:block">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 overflow-auto flex justify-center py-6 px-2 md:px-8">
        <Document
          file={documentInfo.pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Cargando documento...</p>
            </div>
          }
          error={<div className="p-8 text-center text-red-500">Error al cargar el PDF. Revisa si el archivo existe.</div>}
        >
          <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="max-w-full"
            />
          </div>
        </Document>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-t border-border/50 sticky bottom-0 z-10">
        <button 
          onClick={prevPage} 
          disabled={pageNumber <= 1}
          className="px-5 py-2.5 rounded-full bg-secondary font-bold text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        
        <div className="text-sm font-bold font-mono">
          {pageNumber} <span className="text-muted-foreground">/ {numPages || '-'}</span>
        </div>
        
        <button 
          onClick={nextPage} 
          disabled={pageNumber >= (numPages || 1)}
          className="px-5 py-2.5 rounded-full bg-foreground font-bold text-sm text-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

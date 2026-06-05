import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  file: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (data: { numPages: number }) => void;
}

export default function PdfViewer({ file, pageNumber, scale, onLoadSuccess }: Props) {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
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
  );
}

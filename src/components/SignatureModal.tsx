import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Check, PenTool } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  title?: string;
  initialSignature?: string;
}

function getTrimmedSignature(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        hasPixels = true;
      }
    }
  }

  if (!hasPixels) return canvas.toDataURL('image/png');

  const pad = 12;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - minX + pad * 2);
  const cropH = Math.min(height - cropY, maxY - minY + pad * 2);

  const cropped = document.createElement('canvas');
  cropped.width = cropW;
  cropped.height = cropH;
  const cropCtx = cropped.getContext('2d');
  if (!cropCtx) return canvas.toDataURL('image/png');

  cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return cropped.toDataURL('image/png');
}

export default function SignatureModal({
  isOpen,
  onClose,
  onSave,
  title = "Signature Électronique du Client",
  initialSignature
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showExisting, setShowExisting] = useState(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(300, rect.width * dpr);
    canvas.height = Math.max(160, rect.height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';

    setHasDrawn(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialSignature) {
        setShowExisting(true);
      } else {
        setShowExisting(false);
      }

      // Initialiser avec un court délai pour que le layout modal soit stabilisé
      const timer = setTimeout(() => {
        initCanvas();
      }, 60);

      const handleResize = () => initCanvas();
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, initialSignature, initCanvas]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch { /* ignore */ }

    isDrawing.current = true;
    const coords = getCanvasCoords(e);
    lastPoint.current = coords;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
    }
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPoint.current = coords;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch { /* ignore */ }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    setShowExisting(false);
  };

  const handleSave = () => {
    if (showExisting && initialSignature && !hasDrawn) {
      onSave(initialSignature);
      onClose();
      return;
    }

    if (!hasDrawn) {
      alert("Veuillez apposer votre signature au doigt ou à la souris avant de valider.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const trimmedData = getTrimmedSignature(canvas);
    onSave(trimmedData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="glass w-full max-w-lg rounded-3xl overflow-hidden relative border border-white/20 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-xs text-slate-400">Signez au doigt, stylet ou avec la souris</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {showExisting && initialSignature ? (
                <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/50 mb-4 text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Signature déjà enregistrée</p>
                  <img src={initialSignature} alt="Signature enregistrée" className="max-h-36 mx-auto object-contain" />
                  <button
                    onClick={() => { setShowExisting(false); setTimeout(initCanvas, 50); }}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-signer la course
                  </button>
                </div>
              ) : (
                <div
                  ref={containerRef}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-white/20 mb-4 h-56 relative select-none cursor-crosshair shadow-inner"
                  style={{ touchAction: 'none' }}
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="w-full h-full block"
                    style={{ touchAction: 'none' }}
                  />

                  {/* Guide de signature */}
                  <div className="absolute bottom-5 left-8 right-8 flex items-center gap-2 pointer-events-none opacity-30 select-none">
                    <span className="text-sm font-bold text-slate-600 font-mono">✕</span>
                    <div className="flex-1 border-b border-dashed border-slate-600"></div>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Signez ici</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" /> Effacer
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30"
                >
                  <Check className="w-4 h-4" /> Valider la signature
                </button>
              </div>
            </div>

            {/* Footer notice */}
            <div className="px-6 pb-6 pt-0 text-center">
              <p className="text-[11px] text-slate-400">
                La signature sera automatiquement apposée sur le <strong>Bon de Commande</strong> et le <strong>Contrat MAD</strong> (Arrêté du 6 août 2025).
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

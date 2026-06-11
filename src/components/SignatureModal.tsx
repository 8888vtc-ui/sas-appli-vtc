import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Check } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  title?: string;
}

export default function SignatureModal({ isOpen, onClose, onSave, title = "Signature du Client" }: SignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Veuillez signer avant d'enregistrer.");
      return;
    }
    const data = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (data) onSave(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass w-full max-w-lg rounded-3xl overflow-hidden relative"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white/5">
              <div className="bg-white rounded-xl overflow-hidden border-2 border-white/10 mb-4 h-64">
                <SignatureCanvas
                  ref={(ref) => { sigCanvas.current = ref; }}
                  penColor="#000"
                  canvasProps={{
                    className: 'w-full h-full cursor-crosshair'
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clear}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Effacer
                </button>
                <button
                  onClick={save}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                  <Check className="w-4 h-4" /> Valider la signature
                </button>
              </div>
            </div>

            <div className="p-4 bg-white/5 text-center">
              <p className="text-[10px] text-white/40 italic">
                En signant ici, vous attestez avoir pris connaissance des conditions générales de vente et de transport.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

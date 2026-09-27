import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'error' | 'info';
}

type ToastListener = (toast: ToastMessage) => void;
const listeners: ToastListener[] = [];

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    text,
    type,
  };
  listeners.forEach((listener) => listener(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (toast: ToastMessage) => {
      setToasts((prev) => [...prev.slice(-3), toast]); // Max 4 toasts simultaneously
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };

    listeners.push(handleToast);
    return () => {
      const idx = listeners.indexOf(handleToast);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 'max(env(safe-area-inset-top, 16px), 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        width: '90%',
        maxWidth: 420,
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success' || !toast.type;
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 350 }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderRadius: 999,
                background: 'rgba(28, 28, 30, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isSuccess
                  ? '1px solid rgba(48, 209, 88, 0.4)'
                  : isError
                  ? '1px solid rgba(255, 69, 58, 0.4)'
                  : '1px solid rgba(10, 132, 255, 0.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {isSuccess && <CheckCircle2 style={{ width: 17, height: 17, color: '#30d158', flexShrink: 0 }} />}
              {isError && <AlertCircle style={{ width: 17, height: 17, color: '#ff453a', flexShrink: 0 }} />}
              {!isSuccess && !isError && <Info style={{ width: 17, height: 17, color: '#0a84ff', flexShrink: 0 }} />}

              <span style={{ flex: 1, wordBreak: 'break-word' }}>{toast.text}</span>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

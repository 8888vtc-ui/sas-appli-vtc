import type { ToastMessage } from '../components/Toast';

type ToastListener = (toast: ToastMessage) => void;
export const listeners: ToastListener[] = [];

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    text,
    type,
  };
  listeners.forEach((listener) => listener(toast));
}

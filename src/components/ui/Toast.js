import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let toastId = 0;
const listeners = new Set();

export const toast = {
  success: (message) => listeners.forEach(fn => fn({ id: ++toastId, type: 'success', message })),
  info: (message) => listeners.forEach(fn => fn({ id: ++toastId, type: 'info', message })),
  streak: (count) => listeners.forEach(fn => fn({ id: ++toastId, type: 'streak', count })),
  achievement: (label) => listeners.forEach(fn => fn({ id: ++toastId, type: 'achievement', label })),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts(prev => [...prev.slice(-2), t]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== t.id));
    }, 3000);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => listeners.delete(addToast);
  }, [addToast]);

  const icons = {
    success: 'bi-check-circle-fill',
    info: 'bi-info-circle-fill',
    streak: 'bi-fire',
    achievement: 'bi-trophy',
  };

  const colors = {
    success: '#10b981',
    info: 'var(--accent)',
    streak: '#f97316',
    achievement: '#eab308',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-xs">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3 flex items-center gap-3 shadow-xl"
          >
            <i
              className={`bi ${icons[t.type] || icons.info} text-sm`}
              style={{ color: colors[t.type] || colors.info }}
            />
            <p className="text-sm text-white font-medium">
              {t.type === 'streak' ? (
                <>{t.count} dia{t.count !== 1 ? 's' : ''} de racha</>
              ) : t.type === 'achievement' ? (
                <>Logro: {t.label}</>
              ) : (
                t.message
              )}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

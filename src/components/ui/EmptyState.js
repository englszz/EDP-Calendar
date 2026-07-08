import React from 'react';

export default function EmptyState({ iconClass, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 sm:py-16 text-center animate-fade-in">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-white/5" />
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <i className={`bi ${iconClass} text-5xl`} style={{ color: 'var(--accent)' }}></i>
        </div>
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-sm text-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

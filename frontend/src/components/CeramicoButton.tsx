import React from 'react';
import { ChatCircleText } from '@phosphor-icons/react';

interface CeramicoButtonProps {
  onClick: () => void;
}

export default function CeramicoButton({ onClick }: CeramicoButtonProps) {
  return (
    <button
      onClick={onClick}
      title="Cerámico · Pregunta sobre el catálogo y el transporte"
      aria-label="Abrir Cerámico, asistente de catálogo"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: 'var(--accent)',
        color: 'var(--on-accent)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-md)',
        transition: 'all var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--accent-strong)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--accent)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          'var(--shadow-md)';
      }}
    >
      <ChatCircleText size={28} weight="fill" />
    </button>
  );
}

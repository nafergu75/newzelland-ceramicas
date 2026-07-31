import React, { useState } from 'react';
import { ChatCircleText } from '@phosphor-icons/react';

interface CeramicoButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export default function CeramicoButton({ onClick, isOpen = false }: CeramicoButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <style>{`
        @keyframes ceramico-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb, 59, 130, 246), 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(var(--accent-rgb, 59, 130, 246), 0); }
        }
      `}</style>
      <button
        onClick={onClick}
        title="Cerámico · Asistente de catálogo"
        aria-label="Abrir Cerámico, asistente de catálogo"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 50,
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'var(--accent)',
          color: 'var(--on-accent)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isHovered
            ? '0 12px 24px rgba(0, 0, 0, 0.2)'
            : '0 8px 16px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'scale(1.12) translateY(-4px)' : 'scale(1)',
          animation: !isOpen ? 'ceramico-pulse 2s infinite' : 'none',
        }}
      >
        <ChatCircleText
          size={44}
          weight="fill"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      </button>
    </>
  );
}

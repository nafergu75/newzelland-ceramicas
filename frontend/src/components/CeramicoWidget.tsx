import React, { useState, useRef, useEffect } from 'react';
import { X, PaperPlaneRight } from '@phosphor-icons/react';
import api from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface CeramicoWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeriesSlug?: string;
  currentPage?: string;
}

// Convierte texto plano de Claude (párrafos + líneas "- ") en bloques legibles.
function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed === '') {
      return <div key={i} style={{ height: '8px' }} />;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: '6px', margin: '2px 0' }}>
          <span>•</span>
          <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
        </div>
      );
    }
    return (
      <p key={i} style={{ margin: '0 0 6px 0' }}>
        {trimmed}
      </p>
    );
  });
}

export default function CeramicoWidget({
  isOpen,
  onClose,
  currentSeriesSlug,
  currentPage,
}: CeramicoWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hola 👋 Soy Cerámico. Te ayudo con series, formatos, precios y transporte (incluido hasta 500 km desde Onda). ¿Qué te gustaría saber?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mostrar mensaje de bienvenida cuando se abre automáticamente
  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          text: '👋 ¿Hola! ¿Tienes alguna duda? Soy Cerámico, tu asistente de catálogo. Puedo ayudarte con:\n\n✨ Series, formatos y acabados disponibles\n📦 Información sobre transporte\n💬 Cualquier pregunta sobre nuestros productos\n\n¿En qué puedo ayudarte?',
        },
      ]);
      setHasShownWelcome(true);
    }
  }, [isOpen, hasShownWelcome]);

  // Auto-scroll a último mensaje.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
    };

    // Historial previo a este mensaje, para que el backend mantenga el hilo.
    const conversationHistory = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/ceramico', {
        question: inputValue.trim(),
        context: {
          currentSeriesSlug,
          page: currentPage,
          postalCode: postalCode || undefined,
          conversationHistory,
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Actualizar postal code si viene en la respuesta.
      if (response.data.postalCode) {
        setPostalCode(response.data.postalCode);
      }
    } catch (error) {
      console.error('Error al enviar mensaje a Cerámico:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        text: 'Algo ha salido mal al responder. Vuelve a intentarlo o revisa tu conexión.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  if (!isOpen) return null;

  // Detectar mobile viewport.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Overlay oscurecido */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(34, 48, 60, 0.5)',
          zIndex: 99,
          animation: 'fadeIn 300ms ease-out',
        }}
      />

      {/* Panel del chat */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ceramico-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInUp 300ms ease-out',
          ...(isMobile
            ? {
                bottom: 0,
                left: '16px',
                right: '16px',
                top: 'auto',
                width: 'auto',
                height: '78vh',
                borderRadius: '16px 16px 0 0',
              }
            : {
                bottom: '104px',
                right: '24px',
                width: '330px',
                height: '58vh',
                maxHeight: '470px',
                borderRadius: 'var(--radius-card)',
              }),
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            flexShrink: 0,
          }}
        >
          <h2
            id="ceramico-title"
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ink)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Cerámico · Asistente
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar Cerámico"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--stone)',
              transition: 'color var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                'var(--ink)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                'var(--stone)';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Área de mensajes */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--paper)',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent:
                  msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-card)',
                  backgroundColor:
                    msg.role === 'user'
                      ? 'var(--accent)'
                      : 'var(--sand)',
                  color:
                    msg.role === 'user'
                      ? 'var(--on-accent)'
                      : 'var(--ink)',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  fontFamily: 'var(--font-sans)',
                  wordWrap: 'break-word',
                }}
              >
                {msg.role === 'assistant' ? formatMessage(msg.text) : msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-card)',
                  backgroundColor: 'var(--sand)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Cerámico está pensando…
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompts sugeridos (solo si no hay muchos mensajes) */}
        {messages.length === 1 && !isLoading && (
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderTop: '1px solid var(--line)',
              backgroundColor: 'var(--paper)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() =>
                handlePromptClick('¿Qué formatos tiene disponibles?')
              }
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-card)',
                fontSize: '13px',
                cursor: 'pointer',
                color: 'var(--ink)',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--sand)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'transparent';
              }}
            >
              Ver formatos disponibles
            </button>

            <button
              onClick={() =>
                handlePromptClick(
                  '¿El transporte está incluido en el precio?'
                )
              }
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-card)',
                fontSize: '13px',
                cursor: 'pointer',
                color: 'var(--ink)',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--sand)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'transparent';
              }}
            >
              Transporte e incluido
            </button>

            <button
              onClick={() =>
                handlePromptClick(
                  'Qué serie recomendáis para piscina exterior'
                )
              }
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-card)',
                fontSize: '13px',
                cursor: 'pointer',
                color: 'var(--ink)',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--sand)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'transparent';
              }}
            >
              Serie para piscina
            </button>
          </div>
        )}

        {/* Campo de código postal (opcional) */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--line)',
            backgroundColor: 'var(--paper)',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            placeholder="Tu código postal (opcional)"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-input)',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink)',
              backgroundColor: 'var(--surface)',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--accent)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--line)';
            }}
          />
        </div>

        {/* Input y envío */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid var(--line)',
            backgroundColor: 'var(--paper)',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            placeholder="Pregunta por series, formatos, precios…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-input)',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink)',
              backgroundColor: 'var(--surface)',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--accent)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--line)';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Enviar mensaje"
            style={{
              padding: '10px 14px',
              backgroundColor: inputValue.trim() && !isLoading ? 'var(--accent)' : 'var(--sand)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              color: inputValue.trim() && !isLoading ? 'var(--on-accent)' : 'var(--stone)',
              cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim() && !isLoading) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--accent-strong)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                inputValue.trim() && !isLoading ? 'var(--accent)' : 'var(--sand)';
            }}
          >
            <PaperPlaneRight size={18} weight="fill" />
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </>
  );
}

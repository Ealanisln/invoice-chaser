'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SendHorizontal, FileText, Inbox } from 'lucide-react';

type Invoice = {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  date: string;
  body: string;
  invoiceAmount: number;
  invoiceNumber: string;
  invoiceDate: string;
  daysOverdue: number;
  service: string;
};

function formatMXN(amount: number): string {
  return `$${amount.toLocaleString('es-MX')} MXN`;
}

function getOverdueBadgeClass(days: number): string {
  if (days > 60) return 'bg-red-500/15 text-red-400 border-red-500/20';
  if (days >= 30) return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
  return 'bg-zinc-700/60 text-zinc-400 border-zinc-700';
}

function getOverdueLabel(days: number): string {
  if (days === 1) return '1 día vencida';
  return `${days} días vencida`;
}

function extractInvoicesFromMessages(messages: UIMessage[]): Invoice[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg.parts) continue;
    for (let j = msg.parts.length - 1; j >= 0; j--) {
      const part = msg.parts[j] as { type: string; state?: string; output?: unknown };
      if (
        part.type === 'tool-listOverdueInvoices' &&
        part.state === 'output-available' &&
        part.output
      ) {
        const output = part.output as { invoices?: Invoice[] } | Invoice[];
        if (Array.isArray(output)) return output as Invoice[];
        if (output && 'invoices' in output && Array.isArray(output.invoices))
          return output.invoices;
      }
    }
  }
  return [];
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-2">
      <div className="flex items-center gap-1 rounded-lg bg-zinc-800/60 px-3 py-2 border border-zinc-700/50">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function ToolPill({ toolName }: { toolName: string }) {
  const labels: Record<string, string> = {
    listOverdueInvoices: 'buscando facturas vencidas...',
    draftFollowUp: 'redactando mensaje de cobro...',
  };
  const label = labels[toolName] ?? `ejecutando ${toolName}...`;
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
      {label}
    </span>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full px-4 py-1.5', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[82%] space-y-1.5',
          isUser
            ? 'rounded-2xl rounded-tr-sm bg-zinc-800 px-3.5 py-2.5 text-zinc-100 border border-zinc-700/50'
            : 'rounded-xl bg-zinc-900/50 px-3.5 py-2.5 text-zinc-200 border border-zinc-800/80',
        )}
      >
        {message.parts?.map((part, i) => {
          const p = part as { type: string; text?: string; state?: string };

          if (p.type === 'text' && p.text) {
            return (
              <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
                {p.text}
              </p>
            );
          }

          if (p.type.startsWith('tool-')) {
            const toolName = p.type.slice(5);
            const isDone = p.state === 'output-available' || p.state === 'output-error';

            if (isDone) {
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                >
                  <span className="text-emerald-500">✓</span>
                  {toolName}
                </span>
              );
            }

            return <ToolPill key={i} toolName={toolName} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 space-y-2.5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{invoice.fromName}</p>
          <p className="text-xs text-zinc-500 truncate">{invoice.from}</p>
        </div>
        <span
          className={cn(
            'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border',
            getOverdueBadgeClass(invoice.daysOverdue),
          )}
        >
          {getOverdueLabel(invoice.daysOverdue)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-zinc-600 shrink-0" />
          <span className="font-mono text-[11px] text-zinc-500">{invoice.invoiceNumber}</span>
        </div>
        <span className="font-mono text-sm font-semibold text-emerald-400">
          {formatMXN(invoice.invoiceAmount)}
        </span>
      </div>

      <div className="text-xs text-zinc-400 font-medium truncate">{invoice.service}</div>

      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{invoice.body}</p>
    </div>
  );
}

function EmptyInvoicesState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700">
        <Inbox className="h-5 w-5 text-zinc-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-300">Sin facturas detectadas</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Pídele al agente que revise tus facturas para verlas aquí
        </p>
      </div>
    </div>
  );
}

const EXAMPLE_PROMPTS = [
  'Revisa mis facturas vencidas',
  'Redacta un recordatorio cordial para Laura',
  'Aviso final para el gimnasio',
] as const;

export default function InvoiceChaser() {
  const [input, setInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBusy]);

  const adjustTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = 20;
    const maxHeight = lineHeight * 4 + 24;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustTextarea();
  }, [input, adjustTextarea]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;
    setHasStarted(true);
    sendMessage({ text: trimmed });
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isBusy, sendMessage]);

  const handleChipClick = useCallback(
    (prompt: string) => {
      if (isBusy) return;
      setHasStarted(true);
      sendMessage({ text: prompt });
    },
    [isBusy, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const invoices = extractInvoicesFromMessages(messages);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none select-none">💸</span>
          <div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">
              Invoice Chaser
            </span>
            <p className="text-[11px] text-zinc-500 leading-none mt-0.5">
              Tu agente que cobra por ti
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
          <span className="text-xs text-zinc-400 font-medium">Conectado: Mock Inbox</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col w-[60%] border-r border-zinc-800/80 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
                <p className="text-sm font-medium text-zinc-300">
                  Hola, soy tu agente de cobros
                </p>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  Puedo revisar tus facturas vencidas y redactar mensajes de seguimiento
                  personalizados para cada cliente.
                </p>
              </div>
            ) : (
              <div className="py-3 space-y-0.5">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {isBusy && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-950 p-3 space-y-2">
            {!hasStarted && (
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleChipClick(prompt)}
                    disabled={isBusy}
                    className={cn(
                      'rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300',
                      'hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-100 transition-colors',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  disabled={isBusy}
                  className={cn(
                    'w-full resize-none rounded-lg bg-zinc-900 border border-zinc-700/80',
                    'px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600',
                    'focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/50',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'leading-5 overflow-hidden',
                  )}
                  style={{ minHeight: '40px', maxHeight: '104px' }}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isBusy}
                size="icon"
                className={cn(
                  'h-10 w-10 shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500',
                  'text-white border-0 transition-colors',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-zinc-700',
                )}
                aria-label="Enviar mensaje"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-[10px] text-zinc-600">
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        </div>

        <div className="flex flex-col w-[40%] min-h-0 bg-zinc-950">
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Facturas detectadas
              </span>
            </div>
            {invoices.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                {invoices.length}
              </span>
            )}
          </div>

          {invoices.length === 0 ? (
            <EmptyInvoicesState />
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                <span className="text-xs text-zinc-400">Total vencido</span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  {formatMXN(invoices.reduce((sum, inv) => sum + inv.invoiceAmount, 0))}
                </span>
              </div>

              {invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

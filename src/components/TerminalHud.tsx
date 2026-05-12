// src/components/TerminalHud.tsx
import React, { useEffect, useState } from 'react';
import './TerminalHud.css';
import { hudLog, hudReplaceLast, useHudBus } from '../hooks/useHudBus';
import { useLoading } from '../contexts/LoadingContext';

/**
 * Fixed-position terminal HUD. Bottom-left, 320×220. Shows a header with
 * macOS-style traffic lights, a streaming log body, and an uptime footer.
 *
 * This file is the skeleton — bus subscription, boot typewriter, and the
 * collapse/persistence behaviour are layered on in later tasks.
 */

const formatUptime = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

const TerminalHud: React.FC = () => {
  const [uptime, setUptime] = useState(0);
  const messages = useHudBus();
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const userScrolledRef = React.useRef(false);

  // Auto-scroll to bottom whenever messages change, UNLESS the user has
  // manually scrolled away from the bottom. Detect that via a scroll
  // listener with a 12px tolerance.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 12;
      userScrolledRef.current = !atBottom;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || userScrolledRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => setUptime(performance.now() - start), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Boot sequence — types out 5 lines once, after the loader has yielded.
  // The `hasBootedRef` survives React StrictMode's double-mount in dev so
  // boot only runs once per page lifecycle.
  const { isLoading } = useLoading();
  const hasBootedRef = React.useRef(false);
  useEffect(() => {
    if (isLoading || hasBootedRef.current) return;
    hasBootedRef.current = true;

    const lines: { text: string; level: 'ok' | 'info' }[] = [
      { text: '> aurora.init() ............... ok', level: 'ok' },
      { text: '> liquid_glass.shader → mounted',    level: 'info' },
      { text: '> camera_wheel.spy(4 sections)',     level: 'info' },
      { text: '> tech_stack.load(36 items)',        level: 'info' },
      { text: '> ready. listening for events…',    level: 'ok' },
    ];

    // Reduced-motion: skip the typewriter and dump all lines instantly.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      lines.forEach((line) => hudLog(line.text, line.level));
      return;
    }

    let cancelled = false;
    const CHAR_MS = 16;
    const GAP_MS = 200;

    (async () => {
      // Use a placeholder message we keep overwriting for the typewriter
      // effect. After each line is fully typed we drop a final entry at the
      // correct level and start a fresh placeholder for the next line.
      for (let li = 0; li < lines.length; li++) {
        const { text, level } = lines[li];
        hudLog('', 'info');
        for (let i = 1; i <= text.length; i++) {
          if (cancelled) return;
          hudReplaceLast(text.slice(0, i), 'info');
          await new Promise((r) => setTimeout(r, CHAR_MS));
        }
        hudReplaceLast(text, level);
        await new Promise((r) => setTimeout(r, GAP_MS));
        if (cancelled) return;
      }
    })();

    return () => { cancelled = true; };
  }, [isLoading]);

  return (
    <>
      {/* Desktop panel */}
      <div
        className="hud-panel hud-scanlines"
        role="log"
        aria-label="Live activity console"
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          width: 320,
          height: 220,
          zIndex: 40,
          background: 'rgba(7, 6, 14, 0.62)',
          border: '1px solid rgba(124, 227, 139, 0.18)',
          borderRadius: 8,
          backdropFilter: 'blur(10px) saturate(120%)',
          WebkitBackdropFilter: 'blur(10px) saturate(120%)',
          color: '#7CE38B',
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Menlo', monospace",
          fontSize: 11.5,
          lineHeight: 1.45,
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
        }}
      >
        <header
          style={{
            height: 24,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10.5,
            letterSpacing: '0.04em',
          }}
        >
          <span className="hud-dot hud-dot--r" />
          <span className="hud-dot hud-dot--y" />
          <span className="hud-dot hud-dot--g" />
          <span style={{ flex: 1, textAlign: 'center' }}>
            terminal.sh — patrick@portfolio
          </span>
        </header>

        <div
          ref={bodyRef}
          className="hud-body"
          style={{
            height: 180,
            padding: '8px 10px 4px',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                color:
                  m.level === 'ok'
                    ? '#7CE38B'
                    : m.level === 'warn'
                      ? '#FFC857'
                      : '#9EA4B5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {m.text || ' '}
            </div>
          ))}
        </div>

        <footer
          style={{
            height: 16,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'rgba(255, 255, 255, 0.55)',
            fontSize: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <span>uptime: {formatUptime(uptime)}</span>
          <span>
            <span className="hud-caret" />
          </span>
        </footer>
      </div>

      {/* Mobile compact dot — expand handled in Task 7 */}
      <button
        type="button"
        className="hud-mobile"
        aria-label="Open activity console"
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: '1px solid rgba(124, 227, 139, 0.5)',
          background: 'rgba(7, 6, 14, 0.7)',
          backdropFilter: 'blur(10px)',
          color: '#7CE38B',
          zIndex: 40,
        }}
      >
        ›_
      </button>
    </>
  );
};

export default TerminalHud;

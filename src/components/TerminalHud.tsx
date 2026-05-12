// src/components/TerminalHud.tsx
import React, { useEffect, useState } from 'react';
import './TerminalHud.css';

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

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => setUptime(performance.now() - start), 1000);
    return () => window.clearInterval(id);
  }, []);

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
          className="hud-body"
          style={{
            height: 180,
            padding: '8px 10px 4px',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Messages will render here in Task 6 */}
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

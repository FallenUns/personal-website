import type { ReactNode } from 'react';
import { Footer } from '../components/Footer';
import { SiteNav } from '../components/SiteNav';

export function Layout({ address, children }: { address: string; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteNav current={address} />
      <main id="main">{children}</main>
      <Footer />
      {/* Static buttons. A click loads the island, which takes over the element. */}
      <div className="dock">
        <div data-island="feedback" data-trigger="click">
          <button className="dock-btn" type="button">
            Feedback
          </button>
        </div>
        <div data-island="chat" data-trigger="click">
          <button className="dock-btn dock-btn-solid" type="button">
            Ask the assistant
          </button>
        </div>
      </div>
    </>
  );
}

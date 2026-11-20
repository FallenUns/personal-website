import { useEffect, useRef, useState } from 'react';
import { FeedbackForm } from '../components/FeedbackForm';
import { mountIsland } from './mount';
import './forms.css';

function Feedback() {
  const [open, setOpen] = useState(true); // the visitor's click loaded this island
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  return (
    <>
      <button className="dock-btn" type="button" onClick={() => setOpen(true)}>
        Feedback
      </button>
      {/* The native dialog gives the focus trap, Escape and the backdrop. */}
      <dialog ref={dialog} className="dialog" onClose={() => setOpen(false)}>
        {open && <FeedbackForm onClose={() => setOpen(false)} />}
      </dialog>
    </>
  );
}

export function mount(el: HTMLElement) {
  mountIsland(el, <Feedback />);
}

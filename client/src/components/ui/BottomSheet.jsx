import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './BottomSheet.css';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="bottomsheet-overlay" onClick={onClose} />
      <div className="bottomsheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="bottomsheet__handle" />
        <div className="bottomsheet__header">
          <h2 className="bottomsheet__title">{title}</h2>
          <button onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="bottomsheet__body">{children}</div>
      </div>
    </>,
    document.body
  );
}

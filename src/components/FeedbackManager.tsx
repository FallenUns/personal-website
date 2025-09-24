import React, { useState, useEffect } from 'react';
import { FeedbackViewer } from './FeedbackViewer';

export const FeedbackManager: React.FC = () => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + F to open feedback viewer
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setIsViewerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <FeedbackViewer 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)} 
      />
    </>
  );
};
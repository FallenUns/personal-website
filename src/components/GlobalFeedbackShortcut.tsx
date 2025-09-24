import React, { useEffect, useState } from 'react';
import { FeedbackViewer } from './FeedbackViewer';

export const GlobalFeedbackShortcut: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+F (Windows/Linux) or Cmd+Shift+F (Mac)
      if (event.key === 'F' && event.shiftKey && (event.ctrlKey || event.metaKey)) {
        event.preventDefault(); // Prevent browser's default find behavior
        setShowDashboard(true);
      }
      
      // Close with Escape key
      if (event.key === 'Escape' && showDashboard) {
        setShowDashboard(false);
      }
    };

    // Add event listener to window
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDashboard]);

  if (!showDashboard) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <FeedbackViewer 
        isOpen={showDashboard} 
        onClose={() => setShowDashboard(false)} 
      />
    </div>
  );
};
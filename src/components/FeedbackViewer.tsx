import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackService } from '../services/feedbackService';
import type { FeedbackData } from '../types/feedback';

interface FeedbackViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackViewer: React.FC<FeedbackViewerProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFeedbackData();
    }
  }, [isOpen]);

  const loadFeedbackData = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedFeedback = await feedbackService.getStoredFeedback();
      const feedbackStats = await feedbackService.getFeedbackStats();
      setFeedback(storedFeedback);
      setStats(feedbackStats);
    } catch (err) {
      setError('Failed to load feedback data');
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await feedbackService.exportFeedbackAsCSV();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleClearFeedback = () => {
    if (window.confirm('Are you sure you want to clear all feedback? This action cannot be undone.')) {
      feedbackService.clearAllFeedback();
      setFeedback([]);
      setStats(null);
    }
  };

  const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        ({rating}/5)
      </span>
    </div>
  );

  const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    const colors = {
      design: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      content: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      functionality: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      performance: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[category as keyof typeof colors] || colors.general}`}>
        {category}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Feedback Dashboard 📊
                  </h2>
                  {stats && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {stats.totalFeedback} feedback submissions • Average: {stats.averageRating}/5 stars
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={handleClearFeedback}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Feedback List */}
              <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Recent Feedback ({feedback.length})
                  </h3>
                </div>
                <div className="overflow-y-auto h-full p-4 space-y-3">
                  {loading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading feedback...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 py-8">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>{error}</p>
                      <button 
                        onClick={loadFeedbackData}
                        className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : feedback.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>No feedback yet</p>
                      <p className="text-sm">Feedback will appear here when visitors submit it</p>
                    </div>
                  ) : (
                    feedback.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedFeedback?.id === item.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                        }`}
                        onClick={() => setSelectedFeedback(item)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <StarDisplay rating={item.rating} />
                            <div className="mt-1">
                              <CategoryBadge category={item.category} />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Feedback Detail */}
              <div className="w-1/2">
                {selectedFeedback ? (
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Feedback Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                          <p className="text-gray-900 dark:text-white">{selectedFeedback.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                          <p className="text-gray-900 dark:text-white">{selectedFeedback.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                          <StarDisplay rating={selectedFeedback.rating} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                          <div className="mt-1">
                            <CategoryBadge category={selectedFeedback.category} />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
                          <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-1">
                            {selectedFeedback.message}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</label>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(selectedFeedback.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Browser Info</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedFeedback.userAgent}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Referrer</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedFeedback.referrer || 'Direct visit'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p>Select feedback to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
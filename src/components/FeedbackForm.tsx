import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackService } from '../services/feedbackService';
import type { FeedbackFormData } from '../types/feedback';
import LiquidGlass from './LiquidGlass';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    rating: 5,
    category: 'general',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [modalDimensions, setModalDimensions] = useState({
    width: 512,
    height: 700,
    isMobile: false
  });

  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth <= 768;

      const width = isMobile
        ? Math.min(360, Math.max(280, viewportWidth - 24))
        : 512;
      const height = isMobile
        ? Math.min(620, Math.max(520, viewportHeight - 24))
        : 700;

      setModalDimensions({ width, height, isMobile });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      rating: 5,
      category: 'general',
      message: ''
    });
    setSubmitStatus('idle');
    setSubmitMessage('');
    setIsSubmitting(false);
  };

  // Handle close with reset
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const result = await feedbackService.submitFeedback(formData);
      
      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        
        // Reset form after success
        setTimeout(() => {
          resetForm();
          onClose();
        }, 5000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.message);
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Something went wrong. Please try again or contact Patrick directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FeedbackFormData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const StarRating: React.FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({
    rating,
    onRatingChange
  }) => {
    const starButtonSize = modalDimensions.isMobile ? 30 : 36;

    return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <LiquidGlass
          key={star}
          width={starButtonSize}
          height={starButtonSize}
          cornerRadius={starButtonSize / 2}
          blurAmount={4}
          displacementScale={8}
          className="cursor-pointer"
        >
          <button
            type="button"
            onClick={() => onRatingChange(star)}
            className="w-full h-full bg-transparent border-0 outline-none cursor-pointer"
            aria-label={`Rate ${star} out of 5 stars`}
            aria-pressed={star <= rating}
          >
            <span
              className={`text-lg transition-colors ${
                star <= rating 
                  ? 'text-yellow-400' 
                  : 'text-white/40'
              }`}
              aria-hidden="true"
            >
              ★
            </span>
          </button>
        </LiquidGlass>
      ))}
      <span className="ml-2 text-sm text-white/70" aria-live="polite">
        ({rating}/5)
      </span>
    </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full"
            style={{
              maxWidth: `${modalDimensions.width}px`,
              maxHeight: `${modalDimensions.height}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <LiquidGlass
              width={modalDimensions.width}
              height={modalDimensions.height}
              cornerRadius={24}
              blurAmount={12}
              displacementScale={20}
              mode="shader"
              overLight={false}
            >
              <div className="w-full h-full flex flex-col text-white overflow-y-auto" style={{ maxHeight: `${modalDimensions.height}px` }}>
                {submitStatus === 'success' ? (
                  /* Success Thank You Screen */
                  <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="mb-6"
                    >
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Thank You! 🙏
                      </h2>
                      <p className="text-base sm:text-lg text-white/90 mb-2">
                        Your feedback has been received
                      </p>
                      <p className="text-sm text-white/70 max-w-md">
                        {submitMessage}
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-center"
                    >
                      <p className="text-white/60 text-sm mb-6">
                        This form will close automatically in a few seconds
                      </p>
                      <LiquidGlass
                        width={200}
                        height={48}
                        cornerRadius={12}
                        blurAmount={6}
                        displacementScale={12}
                        mode="shader"
                        className="cursor-pointer mx-auto"
                        onClick={handleClose}
                      >
                        <button className="w-full h-full text-white font-medium">
                          Close Now
                        </button>
                      </LiquidGlass>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-white/20 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                          Share Your Feedback 💭
                        </h2>
                        <LiquidGlass
                          width={40}
                          height={40}
                          cornerRadius={20}
                          blurAmount={6}
                          displacementScale={12}
                          mode="shader"
                          className="cursor-pointer"
                          onClick={handleClose}
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </LiquidGlass>
                      </div>
                      <p className="mt-2 text-sm text-white/80">
                        Your feedback helps make this portfolio even better!
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="feedback-name" className="block text-sm font-medium text-white/90 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="feedback-name"
                        name="name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 outline-none px-4 py-3 focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                        placeholder="Your name"
                        aria-label="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="feedback-email" className="block text-sm font-medium text-white/90 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="feedback-email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 outline-none px-4 py-3 focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                        placeholder="your@email.com"
                        aria-label="Your email address"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label htmlFor="feedback-rating" className="block text-sm font-medium text-white/90 mb-2">
                      Overall Rating *
                    </label>
                    <div id="feedback-rating" role="radiogroup" aria-label="Overall rating out of 5 stars">
                      <StarRating 
                        rating={formData.rating} 
                        onRatingChange={(rating) => handleInputChange('rating', rating)}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="feedback-category" className="block text-sm font-medium text-white/90 mb-2">
                      Feedback Category *
                    </label>
                    <select
                      id="feedback-category"
                      name="category"
                      autoComplete="off"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value as FeedbackFormData['category'])}
                      className="w-full h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white outline-none px-4 py-3 focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                      aria-label="Select feedback category"
                    >
                      <option value="general" className="bg-gray-800 text-white">General Feedback</option>
                      <option value="design" className="bg-gray-800 text-white">Design & Visuals</option>
                      <option value="content" className="bg-gray-800 text-white">Content & Information</option>
                      <option value="functionality" className="bg-gray-800 text-white">Functionality & Features</option>
                      <option value="performance" className="bg-gray-800 text-white">Performance & Speed</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="feedback-message" className="block text-sm font-medium text-white/90 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="feedback-message"
                      name="message"
                      autoComplete="off"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full h-28 sm:h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 outline-none px-4 py-3 resize-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                      placeholder="Share your thoughts, suggestions, or any feedback about the portfolio..."
                      aria-label="Your feedback message"
                    />
                  </div>

                  {/* Status Messages */}
                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg"
                    >
                      <LiquidGlass
                        width={Math.max(240, modalDimensions.width - 72)}
                        height={56}
                        cornerRadius={12}
                        blurAmount={8}
                        displacementScale={15}
                        mode="shader"
                        overLight={false}
                        className="w-full"
                      >
                        <div className="flex items-center px-4 py-3">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-300">
                              {submitMessage}
                            </p>
                          </div>
                        </div>
                      </LiquidGlass>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <LiquidGlass
                    width={Math.max(240, modalDimensions.width - 52)}
                    height={modalDimensions.isMobile ? 50 : 56}
                    cornerRadius={14}
                    blurAmount={8}
                    displacementScale={18}
                    mode="shader"
                    overLight={false}
                    className="w-full cursor-pointer"
                    onClick={!isSubmitting ? () => handleSubmit(new Event('submit') as any) : undefined}
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-full bg-transparent text-white font-medium border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                        </div>
                    ) : (
                        'Send Feedback'
                    )}
                    </button>
                    </LiquidGlass>
                  </form>
                  </>
                )}
              </div>
            </LiquidGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

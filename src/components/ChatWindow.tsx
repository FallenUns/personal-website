import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlassLite';
import './ChatScrollbar.css';
import './ChatAlignment.css';
import './mobile-optimizations.css';
import ReactMarkdown from 'react-markdown';
// Define the shape of a message
interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatWindowProps {
  isChatOpen: boolean;
  showOutput: boolean;
  messages: Message[];
  onSendMessage: (input: string) => void | Promise<void>;
  onClose: () => void;
  isPressed: boolean;
  isAITyping: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isChatOpen,
  showOutput,
  messages,
  onSendMessage,
  onClose,
  isPressed,
  isAITyping
}) => {
  const [input, setInput] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [responseHeight, setResponseHeight] = useState(110);
  const [lastTypedMessageId, setLastTypedMessageId] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const responseTextRef = useRef<HTMLParagraphElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const latestResponse = messages.filter(msg => msg.role === 'model').pop();

  // Focus the input when the chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  // Typing animation for the response text - only for new messages
  useEffect(() => {
    if (latestResponse && showOutput) {
      // Create a unique ID for this message based on its content and position
      const messageId = `${messages.length}-${latestResponse.text.slice(0, 50)}`;
      
      // If this message was already typed, show it instantly
      if (lastTypedMessageId === messageId) {
        setDisplayedText(latestResponse.text);
        return;
      }
      
      // New message - animate typing
      let index = 0;
      setDisplayedText('');
      const typeInterval = setInterval(() => {
        if (index < latestResponse.text.length) {
          index++;
          setDisplayedText(latestResponse.text.slice(0, index));
        } else {
          clearInterval(typeInterval);
          // Mark this message as typed
          setLastTypedMessageId(messageId);
        }
      }, 30);
      return () => clearInterval(typeInterval);
    }
  }, [latestResponse, showOutput, messages.length, lastTypedMessageId]);

  // Handle tapping/clicking outside the chat windows to close.
  // Previously this only listened to `mousedown` — but on touch devices,
  // tap → mousedown synthesis is unreliable (it can be delayed or skipped
  // entirely if the touch target has gesture handlers), so mobile users
  // had no way to dismiss the chat. Adding `touchstart` makes tap-to-
  // close work on phone/tablet alongside the existing mouse path.
  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (isAITyping) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;
      const isOutsideResponse = responseRef.current && !responseRef.current.contains(target);
      const isOutsideInput = inputContainerRef.current && !inputContainerRef.current.contains(target);
      const isAssistantIcon = target.closest('.assistant-icon-container') || target.closest('.assistant-icon-wrapper');
      // Don't close when tapping the new explicit close button — it has its
      // own handler that calls onClose.
      const isCloseButton = target.closest('[data-chat-close]');

      if (isChatOpen && isOutsideResponse && isOutsideInput && !isAssistantIcon && !isCloseButton) {
        onClose();
      }
    };
    if (isChatOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('touchstart', handleOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isChatOpen, isAITyping, onClose]);

  // Dynamically adjust the height of the response window and auto-scroll
  useEffect(() => {
    if (showOutput && scrollContainerRef.current) {
      const scrollHeight = responseTextRef.current?.scrollHeight || 0;
      setResponseHeight(Math.min(300, Math.max(110, scrollHeight + 40)));
      
      // Auto-scroll to bottom with a small delay for smooth animation
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [displayedText, showOutput]);

  const handleSend = () => {
    if (isAITyping) return; // Prevent sending while AI is typing
    onSendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
    if (e.key === 'Escape' && !isAITyping) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <>
      {/* Floating Response */}
      <AnimatePresence>
        {showOutput && latestResponse && !isPressed && (
          <motion.div
            ref={responseRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            // Mobile (< sm): bottom-anchored above the input + orb, centred
            // horizontally. The previous `right-[170px]` overflowed off
            // the 390 px viewport. Desktop keeps the original placement.
            className="response-window fixed bottom-[180px] left-1/2 -translate-x-1/2 sm:bottom-[120px] sm:right-[170px] sm:left-auto sm:translate-x-0 z-[50] max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
          >
            <LiquidGlass
              className="liquid-glass"
              width={320}
              height={responseHeight}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={1.2}
              elasticity={0.15}
              blurAmount={3}
              saturation={150}
              displacementScale={60}
              mode='shader'
              overLight={false}
            >              
            <div
                ref={scrollContainerRef}
                className="scroll-container p-4 text-white/90 text-sm leading-relaxed overflow-y-auto h-full scrollbar-transparent chat-container"
                // `data-lenis-prevent` exempts this scroll surface from
                // Lenis's wheel/touch capture. Without it long AI replies
                // were unscrollable inside the panel — every wheel tick
                // scrolled the page instead.
                data-lenis-prevent
                style={{ maxHeight: '300px', textAlign: 'left', overscrollBehavior: 'contain' }}
              >
                <div ref={responseTextRef} className="chat-content chat-text-left" style={{textAlign: 'left', width: '100%'}}>
                  <div className="chat-text-left" style={{textAlign: 'left', width: '100%'}}>
                    <ReactMarkdown
                      components={{
                        strong: ({node, ...props}) => <strong className="font-bold chat-text-left" style={{textAlign: 'left'}} {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 chat-text-left" style={{textAlign: 'left'}} {...props} />,
                        li: ({node, ...props}) => <li className="text-white/90 chat-text-left" style={{textAlign: 'left'}} {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 chat-text-left" style={{textAlign: 'left'}} {...props} />
                      }}
                    >
                      {displayedText}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Input Field */}
      <AnimatePresence>
        {isChatOpen && !isPressed && (
          <motion.div
            ref={inputContainerRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            // Mobile: anchor input near the bottom edge, centred, above the
            // feedback FAB (which now lives at left-3 bottom-28). Desktop
            // keeps original right-edge placement.
            className="chat-input-container fixed bottom-[110px] left-1/2 -translate-x-1/2 sm:bottom-[65px] sm:right-[170px] sm:left-auto sm:translate-x-0 z-[100] max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
          >
            <LiquidGlass
              className="liquid-glass"
              width={320}
              height={50}
              positioning="relative"
              style={{ borderRadius: '25px' }}
              aberrationIntensity={1.2}
              elasticity={0.15}
              blurAmount={3}
              saturation={150}
              displacementScale={60}
              mode='shader'
              overLight={false}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isAITyping} // Input is disabled when AI is typing
                className={`w-full h-full bg-transparent text-white placeholder-white/70 pl-4 pr-12 outline-none border-none ${isAITyping ? 'cursor-not-allowed' : ''}`}
                placeholder={isAITyping ? 'Waiting for response...' : 'Ask me anything...'}
              />
            </LiquidGlass>
            {/* Explicit close button overlaid at the right edge of the input.
                Mobile users had no way to dismiss the chat — `mousedown`-only
                outside detection didn't reliably fire on touch, and there was
                no visible close affordance. This button calls onClose on
                both tap and click. The `data-chat-close` attribute prevents
                the outside-tap listener from also firing onClose (double-
                close, harmless but noisy in state). */}
            <button
              type="button"
              data-chat-close
              onClick={onClose}
              aria-label="Close chat"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-[110] w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-md border border-white/15 text-white/85 transition-colors"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(ChatWindow);

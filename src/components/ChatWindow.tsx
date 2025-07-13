import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import './ChatScrollbar.css';

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

  // Typing animation for the response text
  useEffect(() => {
    if (latestResponse && showOutput) {
      let index = 0;
      setDisplayedText('');
      const typeInterval = setInterval(() => {
        if (index < latestResponse.text.length) {
          setDisplayedText(prev => latestResponse.text.slice(0, prev.length + 1));
        } else {
          clearInterval(typeInterval);
        }
      }, 30);
      return () => clearInterval(typeInterval);
    }
  }, [latestResponse, showOutput]);

  // Handle clicking outside the chat windows to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideResponse = responseRef.current && !responseRef.current.contains(target);
      const isOutsideInput = inputContainerRef.current && !inputContainerRef.current.contains(target);

      if (isChatOpen && isOutsideResponse && isOutsideInput) {
        onClose();
      }
    };
    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen, onClose]);

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
    if (e.key === 'Escape') {
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
            className="fixed bottom-[120px] right-[170px] z-[50] max-w-sm"
          >
            <LiquidGlass
              width={320}
              height={responseHeight}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.3}
              elasticity={0.1}
              blurAmount={3}
              saturation={110}
              displacementScale={90}
              mode='shader'
            >
              <div 
                ref={scrollContainerRef}
                className="scroll-container p-4 text-white/90 text-sm leading-relaxed overflow-y-auto h-full scrollbar-transparent" 
                style={{maxHeight: '300px'}}
              >
                <p ref={responseTextRef}>
                  {displayedText}
                  {isAITyping && <span className="animate-pulse">|</span>}
                </p>
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
            className="fixed bottom-[65px] right-[170px] z-[100] max-w-sm"
          >
            <LiquidGlass
              width={320}
              height={50}
              positioning="relative"
              style={{ borderRadius: '25px' }}
              aberrationIntensity={0.5}
              elasticity={0.1}
              blurAmount={3}
              saturation={120}
              displacementScale={150}
              mode='shader'
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isAITyping} // Input is disabled when AI is typing
                className={`w-full h-full bg-transparent text-white placeholder-white/70 px-4 outline-none border-none ${isAITyping ? 'cursor-not-allowed' : ''}`}
                placeholder={isAITyping ? 'Waiting for response...' : 'Ask me anything...'}
              />
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWindow;
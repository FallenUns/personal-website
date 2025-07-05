// src/components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';

// Define the shape of a message
interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onIsTypingChange?: (isTyping: boolean) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, onIsTypingChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const latestResponse = messages.filter(msg => msg.role === 'model').pop();

  useEffect(() => {
    if (isOpen && showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, showInput]);

  // Reset states when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowInput(true);
      setShowResponse(false);
    }
  }, [isOpen]);

  // Notify parent component when typing state changes
  useEffect(() => {
    if (onIsTypingChange) {
      onIsTypingChange(isTyping);
    }
  }, [isTyping, onIsTypingChange]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setShowResponse(false);
    setShowInput(false);
    setIsTyping(true);
    
    // Notify parent component about typing state
    onIsTypingChange?.(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responseText = "Hi! I'm Patrick's AI assistant. How can I help you learn more about his work?";
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText
      }]);
      setShowResponse(true);
      setIsTyping(false);
      
      // Notify parent component that typing has stopped
      onIsTypingChange?.(false);
      
      // Start typing animation
      setDisplayedText('');
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < responseText.length) {
          setDisplayedText(responseText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          // Show input again after typing is complete
          setTimeout(() => {
            setShowInput(true);
          }, 300);
        }
      }, 30);
    }, 1000);
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
    // Hide response when user starts typing new message
    if (showResponse) {
      setShowResponse(false);
      setDisplayedText('');
    }
  };

  return (
    <>
      {/* Floating Input */}
      <AnimatePresence>
        {isOpen && showInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-8 z-[100]"
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
                className="w-full h-full bg-transparent text-white placeholder-white/70 px-4 outline-none border-none"
                placeholder="Ask me anything..."
              />
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Response */}
      <AnimatePresence>
        {showResponse && latestResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 right-8 z-[99] max-w-sm"
          >
            <LiquidGlass
              width={350}
              height={120}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.3}
              elasticity={0.1}
              blurAmount={3}
              saturation={110}
              displacementScale={90}
              mode='shader'
            >
              <div className="p-4 text-white/90 text-sm leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWindow;
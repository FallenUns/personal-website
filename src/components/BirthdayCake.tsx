import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BirthdayCakeProps {
  onCandlesBlown: () => void;
  audioEnabled: boolean;
}

const BirthdayCake: React.FC<BirthdayCakeProps> = ({ onCandlesBlown, audioEnabled }) => {
  const [candlesLit, setCandlesLit] = useState([true, true, true]); // 3 candles
  const [showConfetti, setShowConfetti] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio analysis
  useEffect(() => {
    if (audioEnabled && candlesLit.some(lit => lit)) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [audioEnabled]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      
      analyser.fftSize = 512; // Increased for better frequency resolution
      analyser.smoothingTimeConstant = 0.3; // Reduced for more responsive detection
      microphone.connect(analyser);
      
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      console.log('Audio listening started successfully');
      detectBlowing();
    } catch (error) {
      console.error('Error starting audio:', error);
    }
  };

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const detectBlowing = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let lastAverage = 0;
    let blowDetected = false;
    
    const checkAudio = () => {
      if (!analyserRef.current || blowDetected) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      // Look for patterns typical of blowing sounds
      // Check for sustained audio above threshold (lowered threshold)
      const threshold = 70; // Lowered from 50 to be more sensitive
      
      // Also check for sudden increase in volume (wind-like sound)
      const volumeIncrease = average - lastAverage;
      
      if (average > threshold || volumeIncrease > 25) {
        console.log(`Blow detected! Average: ${average}, Increase: ${volumeIncrease}`);
        blowDetected = true;
        blowOutNextCandle();
        
        // Reset detection after a short delay
        setTimeout(() => {
          blowDetected = false;
          lastAverage = 0;
        }, 1000);
        return;
      }
      
      lastAverage = average;
      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };
    
    checkAudio();
  };

  const blowOutNextCandle = () => {
    setCandlesLit(prev => {
      const newState = [...prev];
      const litIndex = newState.findIndex(lit => lit);
      
      if (litIndex !== -1) {
        newState[litIndex] = false;
        console.log(`Candle ${litIndex + 1} blown out! Remaining lit candles:`, newState.filter(lit => lit).length);
        
        // If all candles are blown out
        if (newState.every(lit => !lit)) {
          console.log('All candles blown out! Starting celebration...');
          setShowConfetti(true);
          stopListening();
          setTimeout(() => {
            onCandlesBlown();
          }, 1000);
        } else {
          // Continue listening for more candles
          setTimeout(() => {
            if (newState.some(lit => lit)) {
              detectBlowing();
            }
          }, 1500);
        }
      }
      
      return newState;
    });
  };

  // Manual candle blow for testing
  const handleCandleClick = (index: number) => {
    if (candlesLit[index]) {
      setCandlesLit(prev => {
        const newState = [...prev];
        newState[index] = false;
        
        if (newState.every(lit => !lit)) {
          setShowConfetti(true);
          stopListening();
          setTimeout(() => {
            onCandlesBlown();
          }, 1000);
        }
        
        return newState;
      });
    }
  };

  return (
    <div className="relative">
      {/* Enhanced confetti animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, rotate: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.5],
                  rotate: [0, 360, 720],
                  y: [-100, 200],
                  x: [0, (Math.random() - 0.5) * 200],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 1,
                  ease: "easeOut",
                }}
                exit={{ opacity: 0 }}
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{
                    background: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32', '#FF1493', '#00FF00'][i % 8],
                    boxShadow: `0 0 15px ${['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32', '#FF1493', '#00FF00'][i % 8]}`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Enhanced cake design with proper spacing */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "backOut", delay: 0.3 }}
      >
        {/* Cake base with enhanced 3D effect */}
        <div className="relative">
          {/* Cake shadow */}
          <div className="absolute top-8 left-4 right-4 h-32 bg-black/20 rounded-full blur-xl transform scale-110" />
          
          {/* Bottom layer */}
          <motion.div 
            className="relative w-96 h-32 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #8B4513, #A0522D, #CD853F)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.2)',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cake texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/10 via-transparent to-orange-900/20" />
            
            {/* Decorative frosting */}
            <div className="absolute top-3 left-6 right-6 h-6 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full opacity-90 shadow-lg" />
            <div className="absolute top-10 left-8 right-8 h-4 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full opacity-80" />
            
            {/* Side decorations */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-400 rounded-full shadow-md" />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-md" />
          </motion.div>
          
          {/* Top layer */}
          <motion.div 
            className="relative w-80 h-28 rounded-2xl shadow-xl mx-auto -mt-4 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #CD853F, #DEB887, #F4E4BC)',
              boxShadow: '0 15px 30px rgba(0,0,0,0.2), inset 0 2px 8px rgba(255,255,255,0.3)',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cake texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-orange-300/20" />
            
            {/* Top frosting */}
            <div className="absolute top-3 left-6 right-6 h-5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 rounded-full opacity-90 shadow-lg" />
            <div className="absolute top-9 left-8 right-8 h-3 bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 rounded-full opacity-80" />
            
            {/* Decorative elements */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full shadow-sm" />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-sm" />
          </motion.div>
        </div>

        {/* Enhanced candles with better spacing */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 flex gap-16 z-20">
          {candlesLit.map((isLit, index) => (
            <motion.div
              key={index}
              className="relative cursor-pointer group"
              onClick={() => handleCandleClick(index)}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
            >
              {/* Candle glow effect */}
              {isLit && (
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background: 'radial-gradient(circle, #FFD700 0%, #FF6347 50%, transparent 70%)',
                    transform: 'scale(2)',
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1.8, 2.2, 1.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              
              {/* Candle stick with enhanced design */}
              <motion.div 
                className="relative w-4 h-20 rounded-full shadow-xl overflow-hidden"
                style={{
                  background: ['linear-gradient(145deg, #FFFACD, #F0E68C, #DAA520)', 'linear-gradient(145deg, #FFB6C1, #FF69B4, #DC143C)', 'linear-gradient(145deg, #E6E6FA, #DDA0DD, #9370DB)'][index],
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 2px 6px rgba(255,255,255,0.3)',
                }}
              >
                {/* Candle texture */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/10" />
                
                {/* Candle wax drips */}
                <motion.div
                  className="absolute top-2 left-1 w-0.5 h-4 bg-white/40 rounded-full"
                  animate={{
                    scaleY: isLit ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              
              {/* Enhanced flame */}
              <AnimatePresence>
                {isLit && (
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0.8, 1.3, 0.9, 1.1],
                      opacity: 1,
                      y: [0, -3, 0, -2, 0],
                      x: [0, 1, -1, 0.5, 0]
                    }}
                    exit={{ 
                      scale: [1, 0.3, 0],
                      opacity: [1, 0.8, 0],
                      y: [0, -15, -25],
                      transition: { duration: 0.8, ease: "easeOut" }
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Outer flame */}
                    <div 
                      className="relative w-6 h-8 rounded-full shadow-2xl"
                      style={{
                        background: 'radial-gradient(ellipse at center bottom, #FF4500 0%, #FF6347 30%, #FFD700 60%, #FFFF00 90%)',
                        filter: 'blur(0.5px)',
                      }}
                    />
                    
                    {/* Inner flame */}
                    <div 
                      className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-6 rounded-full"
                      style={{
                        background: 'radial-gradient(ellipse at center bottom, #FF8C00 0%, #FFD700 50%, #FFFF00 100%)',
                      }}
                    />
                    
                    {/* Flame core */}
                    <div 
                      className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-4 rounded-full"
                      style={{
                        background: 'linear-gradient(to top, #FFFF00, #FFFFFF)',
                        boxShadow: '0 0 10px #FFD700',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced smoke when blown out */}
              <AnimatePresence>
                {!isLit && (
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0.8, 0.4, 0],
                      scale: [0, 1, 1.5, 2],
                      y: [0, -30, -50, -70],
                      x: [0, Math.random() * 10 - 5, Math.random() * 20 - 10]
                    }}
                    transition={{ duration: 4, ease: "easeOut" }}
                  >
                    <div className="relative">
                      {/* Main smoke */}
                      <div 
                        className="w-3 h-12 rounded-full opacity-60"
                        style={{
                          background: 'linear-gradient(to top, #666666, #CCCCCC, transparent)',
                          filter: 'blur(1px)',
                        }}
                      />
                      
                      {/* Secondary smoke wisps */}
                      <div 
                        className="absolute -left-1 top-2 w-2 h-8 rounded-full opacity-40"
                        style={{
                          background: 'linear-gradient(to top, #888888, transparent)',
                          filter: 'blur(2px)',
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BirthdayCake;
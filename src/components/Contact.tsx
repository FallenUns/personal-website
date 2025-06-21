import React from "react";
import { motion } from 'framer-motion';
import LiquidGlass from "./LiquidGlass";
import { useSimpleLoading } from '../contexts/SimpleLoadingContext';

const Contact: React.FC = () => {
    const { isLoading } = useSimpleLoading();

    return (        <motion.section 
            id="contact" 
            className="h-screen flex items-center justify-center py-16 px-4 w-full pt-24"
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
                opacity: isLoading ? 0 : 1, 
                y: isLoading ? 30 : 0 
            }}
            transition={{ 
                duration: 0.8, 
                ease: 'easeOut',
                delay: isLoading ? 0 : 1.0
            }}
        >
          <div className="text-white text-center">
            <motion.h2 
                className="text-4xl font-bold mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: isLoading ? 0 : 1, 
                    y: isLoading ? 20 : 0 
                }}
                transition={{ 
                    duration: 0.6, 
                    ease: 'easeOut',
                    delay: isLoading ? 0 : 1.2
                }}
            >
                Get In Touch
            </motion.h2>
            <motion.p 
                className="text-lg mb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: isLoading ? 0 : 1, 
                    y: isLoading ? 20 : 0 
                }}
                transition={{ 
                    duration: 0.6, 
                    ease: 'easeOut',
                    delay: isLoading ? 0 : 1.4
                }}
            >
                Let's work together on your next project.
            </motion.p>            <motion.div 
                className="flex justify-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: isLoading ? 0 : 1, 
                    y: isLoading ? 20 : 0 
                }}
                transition={{ 
                    duration: 0.6, 
                    ease: 'easeOut',
                    delay: isLoading ? 0 : 1.6
                }}
            >
              <LiquidGlass
                width={180}
                height={44}
                blur={4}
                positioning="relative"
                style={{ borderRadius: '9999px', cursor: 'pointer' }}
                className="border border-white/70 hover:bg-white/20 transition-all duration-300"
                aberrationIntensity={1}
                borderType='dynamic'
                borderWidth={1}
                edgeRefraction={0.5}
                isElastic={true}
                elasticity={0.2}
                onClick={() => {
                  window.location.href = 'mailto:patrickadrianus04@gmail.com';
                }}
              >
                <span className="px-6 py-3 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-center h-full">
                  Email Me
                </span>
              </LiquidGlass>
              
              <LiquidGlass
                width={180}
                height={44}
                blur={4}
                positioning="relative"
                style={{ borderRadius: '9999px', cursor: 'pointer' }}
                className="border border-white/70 hover:bg-white/20 transition-all duration-300"
                aberrationIntensity={1}
                borderType='dynamic'
                borderWidth={1}
                edgeRefraction={0.5}
                isElastic={true}
                elasticity={0.2}
                onClick={() => {
                  window.open('https://linkedin.com/in/patrick-adrianus', '_blank');
                }}
              >
                <span className="px-6 py-3 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-center h-full">
                  LinkedIn
                </span>
              </LiquidGlass>
            </motion.div>
          </div>
        </motion.section>
    );
}

export default Contact;
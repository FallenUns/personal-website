import React from 'react';
import { useInView } from 'framer-motion';

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1 }) => {
    const [count, setCount] = React.useState(0);
    const ref = React.useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    React.useEffect(() => {
        if (isInView) {
            let start = 0;
            const increment = value / (duration * 60); // 60 FPS
            const timer = setInterval(() => {
                start += increment;
                if (start >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 1000 / 60);
            return () => clearInterval(timer);
        }
    }, [isInView, value, duration]);

    return <span ref={ref}>{count}</span>;
};

export default AnimatedCounter;

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'staggered';
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  staggered: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function ScrollAnimation({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  triggerOnce = true
}: ScrollAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: triggerOnce, 
    amount: threshold,
    margin: '-50px 0px -50px 0px'
  });

  const transition = {
    duration,
    delay,
    ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth animation
  };

  if (animation === 'staggered') {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={animationVariants.staggered}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        transition={transition}
      >
        {Array.isArray(children) 
          ? children.map((child, index) => (
              <motion.div key={index} variants={childVariants}>
                {child}
              </motion.div>
            ))
          : children
        }
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={animationVariants[animation]}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

// Specialized components for common use cases
export function FadeInSection({ children, className = '', delay = 0 }: Omit<ScrollAnimationProps, 'animation'>) {
  return (
    <ScrollAnimation animation="fadeIn" className={className} delay={delay}>
      {children}
    </ScrollAnimation>
  );
}

export function SlideUpSection({ children, className = '', delay = 0 }: Omit<ScrollAnimationProps, 'animation'>) {
  return (
    <ScrollAnimation animation="slideUp" className={className} delay={delay}>
      {children}
    </ScrollAnimation>
  );
}

export function ScaleInSection({ children, className = '', delay = 0 }: Omit<ScrollAnimationProps, 'animation'>) {
  return (
    <ScrollAnimation animation="scaleIn" className={className} delay={delay}>
      {children}
    </ScrollAnimation>
  );
}

export function StaggeredSection({ children, className = '', delay = 0 }: Omit<ScrollAnimationProps, 'animation'>) {
  return (
    <ScrollAnimation animation="staggered" className={className} delay={delay}>
      {children}
    </ScrollAnimation>
  );
} 
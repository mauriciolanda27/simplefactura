import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import { useScrollAnimation } from '../utils/useScrollAnimation';

interface AnimatedContainerProps extends BoxProps {
  children: ReactNode;
  animation?: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

export default function AnimatedContainer({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  ...boxProps
}: AnimatedContainerProps) {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold,
    triggerOnce
  });

  const getAnimationClass = () => {
    if (!isVisible) return '';
    
    const baseClass = animation.replace('-', '-');
    return `${baseClass} ${className}`.trim();
  };

  const getAnimationStyle = () => ({
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : getInitialTransform(animation)
  });

  const getInitialTransform = (anim: string) => {
    switch (anim) {
      case 'slide-in-left':
        return 'translateX(-30px)';
      case 'slide-in-right':
        return 'translateX(30px)';
      case 'scale-in':
        return 'scale(0.9)';
      default:
        return 'translateY(20px)';
    }
  };

  return (
    <Box
      ref={elementRef}
      className={getAnimationClass()}
      style={getAnimationStyle()}
      {...boxProps}
    >
      {children}
    </Box>
  );
}

interface StaggerContainerProps extends BoxProps {
  children: ReactNode[];
  animation?: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  staggerDelay?: number;
  duration?: number;
}

export function StaggerContainer({
  children,
  animation = 'fade-in',
  staggerDelay = 100,
  duration = 600,
  ...boxProps
}: StaggerContainerProps) {
  return (
    <Box {...boxProps}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          duration={duration}
        >
          {child}
        </AnimatedContainer>
      ))}
    </Box>
  );
} 
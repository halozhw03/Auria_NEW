import React from 'react';
import './GlassSurface.css';

interface GlassSurfaceProps {
  children?: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export const GlassSurface = ({
  children,
  className = '',
  blur = 20,
  opacity = 0.15,
  borderRadius = 16,
  style = {},
}: GlassSurfaceProps) => {
  return (
    <div
      className={`glass-surface ${className}`}
      style={{
        backdropFilter: `blur(${blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
        background: `rgba(255, 255, 255, ${opacity})`,
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

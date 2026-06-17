import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function Card({ title, subtitle, children, className = '', id, ...props }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-white border border-neutral-200 rounded-lg p-5 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 id={`${id}-title`} className="font-semibold text-neutral-800 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

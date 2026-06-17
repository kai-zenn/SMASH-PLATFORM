import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  context?: React.ReactNode;
  icon: LucideIcon;
  id?: string;
}

export function StatCard({ label, value, context, icon: Icon, id }: StatCardProps) {
  return (
    <div
      id={id}
      className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-neutral-500 font-normal">{label}</span>
          <h4 className="text-3xl font-bold text-neutral-800 tracking-tight mt-1 tabular-nums">
            {value}
          </h4>
        </div>
        <div className="bg-brand-50 text-brand-500 p-2 rounded-md w-9 h-9 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {context && (
        <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
          {context}
        </div>
      )}
    </div>
  );
}

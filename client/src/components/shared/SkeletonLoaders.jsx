import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="card animate-pulse">
    <div className="skeleton h-4 w-2/3 mb-3" />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`skeleton h-3 mb-2 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card flex items-center gap-4 animate-pulse">
        <div className="skeleton w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-4 w-1/3 mb-2" />
          <div className="skeleton h-3 w-2/3" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const SkeletonStats = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="skeleton h-8 w-8 rounded-xl mb-3" />
        <div className="skeleton h-6 w-1/2 mb-2" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card overflow-hidden p-0">
    <div className="p-4 border-b border-border dark:border-slate-700 animate-pulse">
      <div className="skeleton h-4 w-1/4" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-4 py-3 border-b border-border dark:border-slate-700 last:border-0 flex items-center gap-4 animate-pulse">
        <div className="skeleton h-3 w-1/4" />
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-3 w-1/6" />
        <div className="skeleton h-6 w-16 rounded-full ml-auto" />
      </div>
    ))}
  </div>
);

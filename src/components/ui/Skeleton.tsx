'use client';

import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded ${className}`} />;
}

export function SkeletonMetricCard() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="h-64 flex items-end gap-3 pt-6">
        {[40, 65, 30, 85, 55, 90, 70, 45, 95, 60].map((h, i) => (
          <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-700/60 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="p-4"><Skeleton className="h-4 w-4" /></td>
      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
      <td className="p-4"><Skeleton className="h-4 w-32" /></td>
      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
      <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
      <td className="p-4"><Skeleton className="h-8 w-16" /></td>
    </tr>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-9 w-48" />
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            <th className="p-4"><Skeleton className="h-4 w-4" /></th>
            <th className="p-4"><Skeleton className="h-4 w-16" /></th>
            <th className="p-4"><Skeleton className="h-4 w-24" /></th>
            <th className="p-4"><Skeleton className="h-4 w-20" /></th>
            <th className="p-4"><Skeleton className="h-4 w-16" /></th>
            <th className="p-4"><Skeleton className="h-4 w-16" /></th>
            <th className="p-4"><Skeleton className="h-4 w-16" /></th>
            <th className="p-4"><Skeleton className="h-4 w-16" /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonKanbanCard() {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function SkeletonKanbanBoard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            <SkeletonKanbanCard />
            <SkeletonKanbanCard />
          </div>
        </div>
      ))}
    </div>
  );
}

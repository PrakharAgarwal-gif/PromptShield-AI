'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({
  page = 1,
  total = 0,
  pageSize = 20,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (total <= 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-surface-border text-xs text-text-secondary font-mono ${className}`}
    >
      <div>
        Showing <span className="font-semibold text-aurora-cyan">{startItem}</span> to{' '}
        <span className="font-semibold text-aurora-cyan">{endItem}</span> of{' '}
        <span className="font-semibold text-white">{total}</span> records
      </div>

      <div className="flex items-center gap-2">
        <span className="mr-2">
          Page <span className="font-semibold text-white">{page}</span> of{' '}
          <span className="font-semibold text-white">{Math.max(totalPages, 1)}</span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          icon={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

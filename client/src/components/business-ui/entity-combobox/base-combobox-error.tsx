'use client';

import { cn } from '@/lib/utils';
import { Button } from '@client/src/components/ui/button';

export type BaseComboboxErrorProps = {
  onRetry?: () => void;
  className?: string;
};

export const BaseComboboxError = ({
  onRetry,
  className,
}: BaseComboboxErrorProps) => {
  return (
    <div
      className={cn(
        'flex gap-2 px-2 pt-4 text-sm leading-normal text-muted-foreground',
        className,
      )}
    >
      <div className="max-w-full truncate text-muted-foreground">
        載入失敗，請檢查網路後重試
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="h-auto px-0 text-primary"
      >
        重新整理
      </Button>
    </div>
  );
};

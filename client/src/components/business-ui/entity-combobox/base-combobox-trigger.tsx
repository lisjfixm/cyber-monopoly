'use client';

import { Plus } from 'lucide-react';

import { useEntityComboboxContext } from '@client/src/components/business-ui/entity-combobox/context';
import { SearchTrigger } from '@client/src/components/business-ui/entity-combobox/search-trigger';
import {
  addButtonIconVariants,
  addButtonVariants,
  type ComboboxSize,
} from '@client/src/components/business-ui/entity-combobox/size-variants';
import type {
  ClassNamesConfig,
  ItemValue,
  TriggerRenderProps,
  TriggerType,
} from '@client/src/components/business-ui/entity-combobox/types';
import { cn } from '@/lib/utils';
import { Badge } from '@client/src/components/ui/badge';
import { Button } from '@client/src/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@client/src/components/ui/tooltip';

export type BaseComboboxTriggerProps = {
  triggerType?: TriggerType;
  size?: ComboboxSize;
  placeholder?: string;
  renderTrigger?: (props: TriggerRenderProps) => React.ReactNode;
  maxTagCount?: number | 'responsive';
  maxTagTextLength?: number;
  tagClosable?: boolean;
  classNames?: ClassNamesConfig;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  renderTag?: (
    value: ItemValue,
    onClose: (value: ItemValue, e: React.MouseEvent) => void,
    disabled?: boolean,
  ) => React.ReactNode;
  /**
   * 判斷選項是否禁用
   */
  getOptionDisabled?: (value: ItemValue) => boolean;
  /**
   * button 模式下，自定義渲染加號按鈕的包裹器
   * 用於將按鈕包裹在 PopoverTrigger 中，使浮層跟隨加號按鈕而非整個容器
   */
  renderAddButton?: (button: React.ReactNode) => React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'children'>;

export const BaseComboboxTrigger = ({
  triggerType = 'button',
  size = 'medium',
  placeholder = '請選擇',
  renderTrigger,
  maxTagCount,
  maxTagTextLength,
  tagClosable = true,
  classNames,
  onFocus,
  onBlur,
  renderTag,
  getOptionDisabled,
  renderAddButton,
  ref,
  ...props
}: BaseComboboxTriggerProps) => {
  const {
    selectedValue,
    multiple,
    open,
    disabled,
    handleClear,
    handleDeselect,
  } = useEntityComboboxContext();

  // 自定義渲染 (custom 型別)
  if (triggerType === 'custom' && renderTrigger) {
    return <>{renderTrigger({ selectedValue, multiple, open, disabled })}</>;
  }

  // search 型別
  if (triggerType === 'search') {
    return (
      <SearchTrigger
        size={size}
        placeholder={placeholder}
        maxTagCount={maxTagCount}
        maxTagTextLength={maxTagTextLength}
        tagClosable={tagClosable}
        classNames={classNames}
        onFocus={onFocus as (e: React.FocusEvent<HTMLDivElement>) => void}
        onBlur={onBlur as (e: React.FocusEvent<HTMLDivElement>) => void}
        renderTag={renderTag}
        getOptionDisabled={getOptionDisabled}
      />
    );
  }

  // button 型別（預設）
  const hasValue = !multiple
    ? !!selectedValue
    : Array.isArray(selectedValue) && selectedValue.length > 0;

  // 計算最大顯示標籤數
  const maxDisplayCount =
    typeof maxTagCount === 'number' ? maxTagCount : Infinity;

  // 計算隱藏的標籤
  const hiddenCount =
    multiple && Array.isArray(selectedValue) && typeof maxTagCount === 'number'
      ? Math.max(0, selectedValue.length - maxTagCount)
      : 0;

  const hiddenTags =
    multiple && Array.isArray(selectedValue) && typeof maxTagCount === 'number'
      ? selectedValue.slice(maxTagCount)
      : [];

  // 標籤關閉回撥
  const handleTagClose = (value: ItemValue, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止觸發按鈕點選
    // 禁用的選項不允許關閉
    if (getOptionDisabled?.(value)) return;
    if (!multiple) {
      handleClear(); // 單選模式清空
    } else {
      handleDeselect(value); // 多選模式刪除指定項
    }
  };

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center gap-2',
        classNames?.trigger,
      )}
    >
      {/* 已選擇的標籤顯示區域 */}
      {hasValue && (
        <>
          {!multiple && selectedValue ? (
            renderTag ? (
              renderTag(
                selectedValue as ItemValue,
                handleTagClose,
                getOptionDisabled?.(selectedValue as ItemValue),
              )
            ) : (
              <Badge
                variant="secondary"
                className={cn('h-7 text-xs', classNames?.tag)}
              >
                {(selectedValue as ItemValue).name}
              </Badge>
            )
          ) : multiple &&
            Array.isArray(selectedValue) &&
            selectedValue.length > 0 ? (
            <>
              {renderTag ? (
                <>
                  {selectedValue
                    .slice(0, maxDisplayCount)
                    .map((item) =>
                      renderTag(
                        item,
                        handleTagClose,
                        getOptionDisabled?.(item),
                      ),
                    )}
                  {hiddenCount > 0 && (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'h-7 cursor-pointer text-xs',
                            classNames?.tag,
                          )}
                        >
                          +{hiddenCount}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent
                        className="w-auto max-w-80 p-2"
                        align="start"
                      >
                        <div className="flex flex-wrap gap-1">
                          {hiddenTags.map((item) =>
                            renderTag(
                              item,
                              handleTagClose,
                              getOptionDisabled?.(item),
                            ),
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              ) : (
                <>
                  {selectedValue.slice(0, maxDisplayCount).map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className={cn('h-7 text-xs', classNames?.tag)}
                    >
                      {item.name}
                    </Badge>
                  ))}
                  {hiddenCount > 0 && (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'h-7 cursor-pointer text-xs',
                            classNames?.tag,
                          )}
                        >
                          +{hiddenCount}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent
                        className="w-auto max-w-80 p-2"
                        align="start"
                      >
                        <div className="flex flex-wrap gap-1">
                          {hiddenTags.map((item) => (
                            <Badge
                              key={item.id}
                              variant="secondary"
                              className={cn('h-7 text-xs', classNames?.tag)}
                            >
                              {item.name}
                            </Badge>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </>
          ) : null}
        </>
      )}

      {/* 加號按鈕 - 緊跟標籤 */}
      {(() => {
        const addButton = (
          <Button
            ref={ref}
            variant="secondary"
            size="icon"
            role="combobox"
            aria-expanded={open}
            data-state={open ? 'open' : 'closed'}
            aria-controls="combobox-content"
            disabled={disabled}
            className={addButtonVariants({ size })}
            onFocus={
              onFocus as (e: React.FocusEvent<HTMLButtonElement>) => void
            }
            onBlur={onBlur as (e: React.FocusEvent<HTMLButtonElement>) => void}
            {...props}
          >
            <Plus className={addButtonIconVariants({ size })} />
          </Button>
        );
        return renderAddButton ? renderAddButton(addButton) : addButton;
      })()}
    </div>
  );
};

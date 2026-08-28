"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { CreateLotFormData } from "@/lib/validations/lot.schema";

interface ItemListRowProps {
  /** Current position in the list (0-based). Order # shown is index + 1. */
  index: number;
  /** Total number of items (used for move down and position clamping). */
  totalCount: number;
  onRemove: (index: number) => void;
  canRemove: boolean;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  /** Move the item at fromIndex to toIndex (0-based), reordering the list. */
  onReorder: (fromIndex: number, toIndex: number) => void;
  onEdit: (index: number) => void;
}

export function ItemListRow({
  index,
  totalCount,
  onRemove,
  canRemove,
  onMoveUp,
  onMoveDown,
  onReorder,
  onEdit,
}: ItemListRowProps) {
  const form = useFormContext<CreateLotFormData>();
  const title = form.watch(`items.${index}.title`);
  const displayTitle = title?.trim() ? title : "Untitled item";

  const [isEditingPosition, setIsEditingPosition] = useState(false);
  const [positionValue, setPositionValue] = useState(String(index + 1));

  // Keep the displayed position number in sync when the item's index changes
  // (e.g. another row's swap moved this one), except while the seller is
  // actively typing a new position for this row.
  useEffect(() => {
    if (!isEditingPosition) setPositionValue(String(index + 1));
  }, [index, isEditingPosition]);

  const commitPosition = () => {
    const parsed = parseInt(positionValue, 10);
    if (Number.isFinite(parsed)) {
      const targetIndex = Math.min(Math.max(parsed, 1), totalCount) - 1;
      if (targetIndex !== index) {
        onReorder(index, targetIndex);
      }
    }
    setIsEditingPosition(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-card px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {isEditingPosition ? (
          <Input
            type="number"
            min={1}
            max={totalCount}
            value={positionValue}
            autoFocus
            onChange={(e) => setPositionValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={commitPosition}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitPosition();
              } else if (e.key === "Escape") {
                setPositionValue(String(index + 1));
                setIsEditingPosition(false);
              }
            }}
            className="h-7 w-14 shrink-0 px-2 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingPosition(true)}
            className="shrink-0 rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Click to enter a new position and swap this item's order"
          >
            #{index + 1}
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(index)}
          className="min-w-0 flex-1 truncate text-left font-medium"
        >
          {displayTitle}
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onMoveUp && index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMoveUp(index)}
            title="Move up"
            aria-label="Move item up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
        {onMoveDown && index < totalCount - 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMoveDown(index)}
            title="Move down"
            aria-label="Move item down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEdit(index)}
          title="Edit item"
          aria-label="Edit item"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.confirm(`Remove "${displayTitle}" from this lot?`)) {
                onRemove(index);
              }
            }}
            title="Remove item"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

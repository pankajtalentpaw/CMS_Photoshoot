"use client";

import { useRef, useCallback } from "react";

interface InteractionHandlers {
  onSingleClick: () => void;
  onDoubleClick?: () => void;
  onLongPress?: () => void;
  longPressDelay?: number;
}

export const useInteraction = ({
  onSingleClick,
  onDoubleClick,
  onLongPress,
  longPressDelay = 500,
}: InteractionHandlers) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  // Handle Select / Single Click
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      timerRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          onSingleClick();
        }
        clickCountRef.current = 0;
      }, 300); // Wait for double click
    } else if (clickCountRef.current === 2) {
      if (timerRef.current) clearTimeout(timerRef.current);
      onDoubleClick?.();
      clickCountRef.current = 0;
    }
  }, [onSingleClick, onDoubleClick]);

  // Handle Long Press (Mobile)
  const handleTouchStart = useCallback(() => {
    isLongPressActive.current = false;
    longPressTimerRef.current = setTimeout(() => {
      onLongPress?.();
      isLongPressActive.current = true;
    }, longPressDelay);
  }, [onLongPress, longPressDelay]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    // If it was a long press, prevent the click event from firing selection
    if (isLongPressActive.current) {
      e.preventDefault();
    }
  }, []);

  return {
    onClick: handleClick,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

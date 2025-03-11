import { Dispatch, RefObject, SetStateAction } from "react";

interface TouchActions {
  handleMouseDown: () => void;
  handleMouseUp: () => void;
  handleTouchStart: () => void;
  handleTouchEnd: () => void;
}

export default function useTouchActions(
  handleCopyToClipboard: () => void,
  longPressTimeoutRef: RefObject<NodeJS.Timeout | null>,
  setIsLongPressed: Dispatch<SetStateAction<boolean>>,
): TouchActions {
  const handleMouseDown = (): void => {
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPressed(true);
      handleCopyToClipboard();
    }, 500); // 500ms for long press
  };

  const handleMouseUp = (): void => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setIsLongPressed(false);
  };

  const handleTouchStart = (): void => {
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPressed(true);
      handleCopyToClipboard();
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = (): void => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setIsLongPressed(false);
  };

  return {
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
  };
}

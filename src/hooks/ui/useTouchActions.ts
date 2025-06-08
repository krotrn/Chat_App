import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
} from "react";

interface TouchActions {
  handleMouseDown: () => void;
  handleMouseUp: () => void;
  handleTouchStart: () => void;
  handleTouchEnd: () => void;
}

export default function useTouchActions(
  action: () => void,
  longPressTimeoutRef: RefObject<NodeJS.Timeout | null>,
  setIsLongPressed: Dispatch<SetStateAction<boolean>>,
): TouchActions {
  const handleMouseDown = useCallback((): void => {
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPressed(true);
      action();
    }, 500);
  }, [action, longPressTimeoutRef, setIsLongPressed]);

  const handleMouseUp = useCallback((): void => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setIsLongPressed(false);
  }, [longPressTimeoutRef, setIsLongPressed]);

  const handleTouchStart = useCallback((): void => {
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPressed(true);
      action();
    }, 500);
  }, [action, longPressTimeoutRef, setIsLongPressed]);

  const handleTouchEnd = useCallback((): void => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setIsLongPressed(false);
  }, [longPressTimeoutRef, setIsLongPressed]);

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [longPressTimeoutRef]);

  return {
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
  };
}

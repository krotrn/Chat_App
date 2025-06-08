import { useCallback, useEffect, useRef, useState } from "react";

const useCountdown = (
  initialSeconds: number,
): { secondsLeft: number; startCountdown: (second: number) => void } => {
  const [secondsLeft, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const startCountdown = useCallback((seconds: number) => {
    setSeconds(seconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { secondsLeft, startCountdown };
};
export { useCountdown };

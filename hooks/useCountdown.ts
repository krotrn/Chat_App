import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook that provides a countdown timer functionality.
 *
 * @param {number} initialSeconds - The initial number of seconds for the countdown.
 * @returns {Object} An object containing:
 * - `secondsLeft` (number): The current number of seconds left in the countdown.
 * - `startCountdown` (function): A function to start the countdown with a specified number of seconds.
 *
 * @example
 * const { secondsLeft, startCountdown } = useCountdown(60);
 *
 * useEffect(() => {
 *   startCountdown(30);
 * }, []);
 */
const useCountdown = (
  initialSeconds: number
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
export default useCountdown;

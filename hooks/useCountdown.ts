import { useEffect, useRef, useState } from "react";

const useCountdown = (initialSeconds: number) => {
  const [secondsLeft, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);

  const startCountdown = (seconds: number) => {
    setSeconds(seconds);
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) clearInterval(intervalRef.current);
        return s > 0 ? s - 1 : 0;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return { secondsLeft, startCountdown };
};

export default useCountdown;

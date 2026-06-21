"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSetTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    if (startAtRef.current === null) return;
    setElapsed(Math.floor((Date.now() - startAtRef.current) / 1000));
  }, []);

  const start = useCallback(() => {
    startAtRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startAtRef.current === null) return 0;
    const final = Math.floor((Date.now() - startAtRef.current) / 1000);
    setElapsed(final);
    startAtRef.current = null;
    return final;
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    startAtRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(tick, 200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  return { elapsed, running, start, stop, reset };
}

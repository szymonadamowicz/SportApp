"use client";
import { useEffect, useState } from "react";

export const useNow = (intervalMs = 60_000) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;

    const updateNow = () => {
      setNow(new Date());
    };

    const getDelay = () => {
      if (intervalMs === 60_000) {
        const d = new Date();
        return (
          60_000 -
          (d.getSeconds() * 1000 + d.getMilliseconds())
        );
      }

      return intervalMs - (Date.now() % intervalMs);
    };

    const timeoutId = window.setTimeout(() => {
      updateNow();
      intervalId = window.setInterval(updateNow, intervalMs);
    }, getDelay());

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [intervalMs]);

  return now;
};

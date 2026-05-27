import { useEffect, useState } from "react";

/** Re-render every minute so past slots disappear in real time. */
export default function useNowTicker(intervalMs = 60_000) {
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return tick;
}

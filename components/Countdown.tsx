'use client';

import { useState, useEffect } from 'react';
import { RACE_DATE } from '@/lib/constants';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = RACE_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] flex items-center justify-center rounded-xl bg-midnight-900/70 border border-lunar-400/10">
        <span className="font-mono text-2xl sm:text-3xl text-moonlight font-light tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs font-body uppercase tracking-[0.2em] text-stardust/40">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-3 sm:gap-4 justify-center">
        {['Days', 'Hours', 'Min', 'Sec'].map((l) => (
          <Segment key={l} value={0} label={l} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      <Segment value={time.days} label="Days" />
      <Segment value={time.hours} label="Hours" />
      <Segment value={time.minutes} label="Min" />
      <Segment value={time.seconds} label="Sec" />
    </div>
  );
}

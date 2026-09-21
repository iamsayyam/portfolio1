'use client';

import { useEffect, useState } from 'react';
import City from './City';
import PageView from './PageView';

export default function Experience() {
  const [mode, setMode] = useState<'city' | 'page'>('city');
  const [ready, setReady] = useState(false);

  // Visitors who ask for less motion start on the plain page.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMode('page');
    setReady(true);
  }, []);

  // The city fills the screen, so the page behind it must not scroll.
  useEffect(() => {
    document.documentElement.style.overflow = mode === 'city' ? 'hidden' : '';
    if (mode === 'page') window.scrollTo(0, 0);
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [mode]);

  return (
    <>
      {mode === 'city' && <City ready={ready} onLeave={() => setMode('page')} />}
      <PageView active={mode === 'page'} hydrated={ready} onWalk={() => setMode('city')} />
    </>
  );
}

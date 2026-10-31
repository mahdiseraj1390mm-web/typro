'use client';

import React, { useEffect, useState } from 'react';

export default function AmbientBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Top Chromatic RGB Laser Edge (Underglow Header Sweep) */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-fuchsia-500 via-indigo-500 via-amber-400 to-cyan-400 animate-rgb-laser opacity-85" />

      {/* Layer 1: Full-Screen Continuous Flowing RGB Aurora Blanket */}
      <div className="absolute inset-0 w-full h-full rgb-aurora-fullscreen mix-blend-multiply" />

      {/* Layer 2: Full-Screen Secondary Chromatic Counter-Flow Wave */}
      <div className="absolute inset-0 w-full h-full rgb-aurora-secondary mix-blend-screen" />
    </div>
  );
}

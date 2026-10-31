'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let vid = localStorage.getItem('typro_visitor_id');
    if (!vid) {
      vid = 'vid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('typro_visitor_id', vid);
    }
    return vid;
  } catch {
    return 'vid_' + Date.now().toString(36);
  }
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = sessionStorage.getItem('typro_session_id');
    if (!sid) {
      sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('typro_session_id', sid);
    }
    return sid;
  } catch {
    return 'sid_' + Date.now().toString(36);
  }
}

export default function GlobalTrafficTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (!pathname || pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    const track = () => {
      try {
        const visitorId = getOrCreateVisitorId();
        const sessionId = getOrCreateSessionId();
        const activeUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('typro_user_id') : undefined) || undefined;

        const payload = {
          visitorId,
          sessionId,
          path: pathname,
          userId: activeUserId,
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        };

        fetch('/api/admin/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };

    track();

    // Heartbeat every 35s while active on current page
    const interval = setInterval(() => {
      try {
        const visitorId = getOrCreateVisitorId();
        const sessionId = getOrCreateSessionId();
        const activeUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('typro_user_id') : undefined) || undefined;

        fetch('/api/admin/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            sessionId,
            path: pathname,
            userId: activeUserId,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }, 35000);

    return () => clearInterval(interval);
  }, [pathname, user?.id]);

  return null;
}

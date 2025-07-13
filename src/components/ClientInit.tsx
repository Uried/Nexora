"use client";

import { useEffect } from 'react';

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0');
    hex.push(h);
  }
  return hex.join('');
}

type NavLike = Partial<Pick<Navigator, 'userAgent' | 'language'>> & {
  platform?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
};

type ScreenLike = Partial<Pick<Screen, 'colorDepth' | 'width' | 'height'>>;

async function computeFingerprint(): Promise<string> {
  try {
    const nav: NavLike = typeof navigator !== 'undefined' ? navigator : {};
    const scr: ScreenLike = typeof screen !== 'undefined' ? screen : {};
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const parts = [
      nav.userAgent || '',
      nav.language || '',
      nav.platform || '',
      nav.hardwareConcurrency?.toString?.() || '',
      nav.deviceMemory?.toString?.() || '',
      scr.colorDepth?.toString?.() || '',
      scr.width?.toString?.() || '',
      scr.height?.toString?.() || '',
      tz,
    ].join('|');

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const enc = new TextEncoder().encode(parts);
      const digest = await crypto.subtle.digest('SHA-256', enc);
      return toHex(digest);
    }
  } catch {
    // ignore and fallback below
  }
  // Fallback to random if hashing not available
  return `anon-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export default function ClientInit() {
  useEffect(() => {
    try {
      const KEY = 'kasiUserId';
      const existing = localStorage.getItem(KEY);
      if (!existing) {
        computeFingerprint().then((fp) => {
          localStorage.setItem(KEY, fp);
        });
      }
    } catch {
      // localStorage may be unavailable in some contexts
    }
  }, []);

  return null;
}

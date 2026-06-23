'use client';

import { useEffect } from 'react';
import { clearAdminPulse } from '@/lib/admin-tour';

/** Admin paneline girildiğinde yanıp sönen düğmeyi kapatır. */
export default function AdminPulseClear() {
  useEffect(() => {
    clearAdminPulse();
  }, []);
  return null;
}

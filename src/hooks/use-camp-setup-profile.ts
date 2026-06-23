'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_CAMP_SETUP_PROFILE,
  mergeCampSetupProfile,
  normalizeCampSetupProfile,
  type CampSetupProfile,
} from '@/lib/camp-setup-profile';

export function useCampSetupProfile() {
  const [profile, setProfile] = useState<CampSetupProfile>(DEFAULT_CAMP_SETUP_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/campaign', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Profil yüklenemedi');
        return;
      }
      setProfile(normalizeCampSetupProfile(data.camp_setup_profile));
    } catch {
      setError('Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patchProfile = useCallback(
    async (patch: Partial<CampSetupProfile>) => {
      const next = mergeCampSetupProfile(profile, patch);
      setProfile(next);
      setSaving(true);
      setError('');
      try {
        const res = await fetch('/api/admin/campaign', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ camp_setup_profile: patch }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Kaydedilemedi');
          await load();
          return false;
        }
        setProfile(normalizeCampSetupProfile(data.campaign?.camp_setup_profile));
        return true;
      } catch {
        setError('Kaydedilemedi');
        await load();
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profile, load]
  );

  const resetProfile = useCallback(async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/campaign/reset-setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sıfırlanamadı');
        return false;
      }
      setProfile(normalizeCampSetupProfile(data.camp_setup_profile));
      return true;
    } catch {
      setError('Sıfırlanamadı');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, saving, error, patchProfile, resetProfile, reload: load };
}

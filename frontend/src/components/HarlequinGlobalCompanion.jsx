import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import HarlequinCompanionPopup from './HarlequinCompanionPopup';
import { resolveHarlequinWorldEvent } from '../utils/harlequinEvents';
import { playHarlequinCardTapSound } from '../utils/harlequinAudio';

export default function HarlequinGlobalCompanion() {
  const [profile, setProfile] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const profileRef = useRef(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/guild-bazaar/status`);
      if (res.data?.success && res.data?.data) {
        profileRef.current = res.data.data;
        setProfile(res.data.data);
      }
    } catch {
      // ignora em caso de erro offline
    }
  }, []);

  useEffect(() => {
    loadProfile();

    const onSync = (ev) => {
      if (ev?.detail) {
        profileRef.current = ev.detail;
        setProfile(ev.detail);
        if (ev.detail.avatarEnabled === false) {
          setActiveEvent(null);
        }
      } else {
        loadProfile();
      }
    };

    const onWorldEvent = (ev) => {
      const currentProfile = profileRef.current;
      if (!currentProfile || currentProfile.avatarEnabled === false) return;
      const { type, payload } = ev?.detail || {};
      if (!type) return;

      const nextSeed = Date.now() % 97;
      const reaction = resolveHarlequinWorldEvent({
        type,
        payload,
        profile: currentProfile,
        seed: nextSeed,
      });
      if (!reaction) return;

      if (!reaction.silentSound) {
        playHarlequinCardTapSound(reaction.skinId, reaction.soundMood, false);
      }
      setActiveEvent({
        ...reaction,
        key: `global_${reaction.eventId}_${Date.now()}`,
      });
    };

    window.addEventListener('cine-harlequin-profile-sync', onSync);
    window.addEventListener('cine-harlequin-world-event', onWorldEvent);
    return () => {
      window.removeEventListener('cine-harlequin-profile-sync', onSync);
      window.removeEventListener('cine-harlequin-world-event', onWorldEvent);
    };
  }, [loadProfile]);

  if (!profile || profile.avatarEnabled === false || !activeEvent) return null;

  return (
    <HarlequinCompanionPopup
      event={activeEvent}
      soundEnabled
      autoCloseMs={11000}
      onDismiss={() => setActiveEvent(null)}
    />
  );
}

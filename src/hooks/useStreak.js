import { useState, useEffect } from 'react';
import {
  doc, onSnapshot, setDoc, updateDoc, getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { format, subDays } from 'date-fns';

const ACHIEVEMENTS = [
  { id: 'first_task',     label: 'Primera tarea',       description: 'Completaste tu primera tarea',          icon: 'bi-check-circle',   condition: (s) => s.totalCompleted >= 1 },
  { id: 'streak_3',       label: 'Racha de 3',          description: '3 dias seguidos productivo',            icon: 'bi-fire',           condition: (s) => s.longestStreak >= 3 },
  { id: 'streak_7',       label: 'Productor semanal',   description: '7 dias seguidos productivo',            icon: 'bi-trophy',         condition: (s) => s.longestStreak >= 7 },
  { id: 'streak_30',      label: 'Imparable',           description: '30 dias seguidos productivo',           icon: 'bi-lightning-charge', condition: (s) => s.longestStreak >= 30 },
  { id: 'tasks_50',       label: 'Medio centenar',      description: '50 tareas completadas',                 icon: 'bi-award',          condition: (s) => s.totalCompleted >= 50 },
  { id: 'tasks_100',      label: 'Centurion',           description: '100 tareas completadas',                icon: 'bi-star',           condition: (s) => s.totalCompleted >= 100 },
  { id: 'saver_1000',     label: 'Ahorrador',           description: 'Ahorraste RD$1,000 en metas',           icon: 'bi-piggy-bank',     condition: (s) => s.totalSaved >= 1000 },
  { id: 'no_overdue',     label: 'Al dia',              description: 'Zero tareas vencidas',                  icon: 'bi-shield-check',   condition: (s) => s.hasZeroOverdue },
];

export const useStreak = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalCompleted: 0,
    totalSaved: 0,
    hasZeroOverdue: false,
    achievements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'streaks', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setStreakData({
          currentStreak: d.currentStreak || 0,
          longestStreak: d.longestStreak || 0,
          lastActiveDate: d.lastActiveDate || null,
          totalCompleted: d.totalCompleted || 0,
          totalSaved: d.totalSaved || 0,
          hasZeroOverdue: d.hasZeroOverdue || false,
          achievements: d.achievements || [],
        });
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const updateStreak = async ({ totalCompleted, totalSaved, hasZeroOverdue }) => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const ref = doc(db, 'streaks', user.uid);
    const snap = await getDoc(ref);

    let current = 0;
    let longest = 0;
    let lastActive = null;
    let prevAchievements = [];

    if (snap.exists()) {
      const d = snap.data();
      current = d.currentStreak || 0;
      longest = d.longestStreak || 0;
      lastActive = d.lastActiveDate || null;
      prevAchievements = d.achievements || [];
    }

    if (lastActive === todayStr) {
      await updateDoc(ref, {
        totalCompleted: totalCompleted || 0,
        totalSaved: totalSaved || 0,
        hasZeroOverdue: hasZeroOverdue || false,
      }).catch(() => {});
      return;
    }

    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    let newStreak = 1;
    if (lastActive === yesterday) {
      newStreak = current + 1;
    }

    const newLongest = Math.max(longest, newStreak);

    const stateForAchievements = {
      totalCompleted: totalCompleted || 0,
      longestStreak: newLongest,
      totalSaved: totalSaved || 0,
      hasZeroOverdue: hasZeroOverdue || false,
    };

    const newAchievements = ACHIEVEMENTS
      .filter(a => a.condition(stateForAchievements) && !prevAchievements.includes(a.id))
      .map(a => a.id);

    const allAchievements = [...prevAchievements, ...newAchievements];

    await setDoc(ref, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: todayStr,
      totalCompleted: totalCompleted || 0,
      totalSaved: totalSaved || 0,
      hasZeroOverdue: hasZeroOverdue || false,
      achievements: allAchievements,
    }, { merge: true });
  };

  const getUnlockedAchievements = () => {
    return ACHIEVEMENTS.filter(a => streakData.achievements.includes(a.id));
  };

  const getNextAchievement = () => {
    return ACHIEVEMENTS.find(a => !streakData.achievements.includes(a.id));
  };

  return {
    ...streakData,
    loading,
    updateStreak,
    getUnlockedAchievements,
    getNextAchievement,
    ACHIEVEMENTS,
  };
};

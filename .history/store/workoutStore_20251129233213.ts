import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, Set } from '../types';
import { EXERCISES } from '@/data/exercises';

interface WorkoutState {
    // History & Progress
    history: Record<string, Session[]>;
    skillProgress: Record<string, number>;

    // Active Session
    activeExerciseId: string | null;
    activeLevel: number | null; // Added to track specific level being trained
    sessionStartTime: number | null;
    currentSets: Set[];

    // Actions
    startSession: (exerciseId: string, level?: number) => void;
    addSet: (set: Set) => void;
    removeSet: (index: number) => void;
    finishSession: () => void;
    cancelSession: () => void;
    updateSkillProgress: (exerciseId: string, level: number) => void;
    resetSkillProgress: (exerciseId: string) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            history: {},
            skillProgress: {},
            activeExerciseId: null,
            activeLevel: null,
            sessionStartTime: null,
            currentSets: [],

            startSession: (exerciseId, level) => {
                set({
                    activeExerciseId: exerciseId,
                    activeLevel: level || null,
                    sessionStartTime: Date.now(),
                    currentSets: [],
                });
            },

            addSet: (newSet) => {
                set((state) => ({
                    currentSets: [...state.currentSets, newSet],
                }));
            },

            removeSet: (index) => {
                set((state) => ({
                    currentSets: state.currentSets.filter((_, i) => i !== index),
                }));
            },

            finishSession: () => {
                const { activeExerciseId, sessionStartTime, currentSets, history, skillProgress, activeLevel } = get();
                if (!activeExerciseId || !sessionStartTime) return;

                const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);

                const newSession: Session = {
                    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    exerciseId: activeExerciseId,
                    timestamp: Date.now(),
                    sets: currentSets,
                    durationSeconds,
                };

                const exerciseHistory = history[activeExerciseId] || [];

                // Determine if this session completes an Elite roadmap level and advance progress
                let newSkillProgress = { ...skillProgress };
                try {
                    const exercise = EXERCISES.find(e => e.id === activeExerciseId);
                    if (exercise && exercise.category === 'Elite' && activeLevel && exercise.roadmap) {
                        const step = exercise.roadmap.find(r => r.level === activeLevel);
                        if (step) {
                            const goal = step.goal || '';
                            const numMatch = goal.match(/(\d+)/);
                            let achieved = false;
                            if (numMatch) {
                                const target = parseInt(numMatch[1], 10);
                                const isSeconds = /s\b|sec|hold/i.test(goal);

                                if (isSeconds) {
                                    achieved = currentSets.some(s => {
                                        const w = (s.weightOrTime || '').match(/(\d+)/)?.[1];
                                        const r = (s.reps || '').match(/(\d+)/)?.[1];
                                        const wNum = w ? parseInt(w, 10) : NaN;
                                        const rNum = r ? parseInt(r, 10) : NaN;
                                        return (!isNaN(wNum) && wNum >= target) || (!isNaN(rNum) && rNum >= target);
                                    });
                                } else {
                                    // treat as reps
                                    achieved = currentSets.some(s => {
                                        const r = (s.reps || '').match(/(\d+)/)?.[1];
                                        const rNum = r ? parseInt(r, 10) : NaN;
                                        return (!isNaN(rNum) && rNum >= target);
                                    });
                                }
                            }

                            if (achieved) {
                                const current = skillProgress[activeExerciseId] || 1;
                                const maxLevel = exercise.roadmap.length;
                                const advanced = Math.min(activeLevel + 1, maxLevel + 1);
                                if (advanced > current) {
                                    newSkillProgress[activeExerciseId] = advanced;
                                }
                            }
                        }
                    }
                } catch (e) {
                    // swallow parsing errors to avoid breaking finish flow
                    console.warn('Error evaluating elite goal:', e);
                }

                set({
                    history: {
                        ...history,
                        [activeExerciseId]: [newSession, ...exerciseHistory], // Newest first
                    },
                    skillProgress: newSkillProgress,
                    activeExerciseId: null,
                    activeLevel: null,
                    sessionStartTime: null,
                    currentSets: [],
                });
            },

            cancelSession: () => {
                set({
                    activeExerciseId: null,
                    sessionStartTime: null,
                    currentSets: [],
                });
            },

            updateSkillProgress: (exerciseId, level) => {
                set((state) => ({
                    skillProgress: {
                        ...state.skillProgress,
                        [exerciseId]: level,
                    },
                }));
            },

            resetSkillProgress: (exerciseId) => {
                set((state) => {
                    const newProgress = { ...state.skillProgress };
                    delete newProgress[exerciseId];
                    return { skillProgress: newProgress };
                });
            }
        }),
        {
            name: 'cali-tracker-storage',
        }
    )
);

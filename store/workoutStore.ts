import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, Set } from '../types';

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
                const { activeExerciseId, sessionStartTime, currentSets, history } = get();
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

                set({
                    history: {
                        ...history,
                        [activeExerciseId]: [newSession, ...exerciseHistory], // Newest first
                    },
                    activeExerciseId: null,
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

'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { EXERCISES } from '@/data/exercises';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Timer, History, Plus, X, Play, Pause, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ActiveSessionModal() {
    const { activeExerciseId, sessionStartTime, currentSets, addSet, removeSet, finishSession, cancelSession, history, skillProgress } = useWorkoutStore();
    const [elapsed, setElapsed] = useState(0);
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');

    const exercise = EXERCISES.find(e => e.id === activeExerciseId);
    const lastSession = exercise ? history[exercise.id]?.[0] : undefined;

    const currentLevel = (exercise && exercise.category === 'Elite') ? (skillProgress[exercise.id] || 1) : null;
    const displayExerciseName = (currentLevel && exercise?.roadmap)
        ? `${exercise.name}: ${exercise.roadmap.find(r => r.level === currentLevel)?.name}`
        : exercise?.name;

    useEffect(() => {
        if (!sessionStartTime) {
            setElapsed(0);
            return;
        }
        setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));

        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionStartTime]);

    if (!activeExerciseId || !exercise) return null;

    const handleAddSet = () => {
        if (!reps) return;
        addSet({ reps, weightOrTime: weight });
        setReps('');
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={!!activeExerciseId} onOpenChange={(open) => !open && cancelSession()}>
            <DialogContent className="sm:max-w-md bg-zinc-950/90 backdrop-blur-xl text-zinc-50 border-zinc-800 shadow-2xl p-0 gap-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>

                {/* Header HUD */}
                <div className="bg-zinc-900/50 border-b border-white/5 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-white tracking-tight">{displayExerciseName}</DialogTitle>
                            <DialogDescription className="text-zinc-400 text-sm font-medium uppercase tracking-wider mt-1">Active Session</DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <Timer className="w-4 h-4 text-emerald-400" />
                            <span className="font-mono text-emerald-400 font-bold tabular-nums">{formatTime(elapsed)}</span>
                        </div>
                    </div>

                    {/* Historical Data Pill */}
                    {lastSession && (
                        <div className="inline-flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-white/5 text-xs text-zinc-400">
                            <History className="w-3 h-3" />
                            <span>Last: {lastSession.sets.map(s => s.reps).join(', ')}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Sets List */}
                    <div className="space-y-3 min-h-[120px]">
                        <AnimatePresence initial={false}>
                            {currentSets.map((set, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="flex items-center justify-between bg-zinc-900/40 p-3 rounded-xl border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                                            {i + 1}
                                        </span>
                                        <span className="font-bold text-zinc-200 text-lg">{set.reps} <span className="text-sm font-normal text-zinc-500">reps</span></span>
                                        {set.weightOrTime && <span className="text-zinc-400 text-sm border-l border-zinc-700 pl-3">{set.weightOrTime}</span>}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeSet(i)} className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded-full">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentSets.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl">
                                <p className="text-zinc-500 text-sm">No sets completed yet</p>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Reps"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 h-12 text-lg rounded-xl focus:ring-blue-500/20"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSet()}
                                autoFocus
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Weight/Time"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 h-12 text-lg rounded-xl focus:ring-blue-500/20"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSet()}
                            />
                        </div>
                        <Button onClick={handleAddSet} className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0" disabled={!reps}>
                            <Plus className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-zinc-900/30 border-t border-white/5 flex gap-3">
                    <Button variant="ghost" className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800 h-12 rounded-xl" onClick={cancelSession}>
                        Cancel
                    </Button>
                    <Button className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-xl font-semibold text-lg shadow-lg shadow-emerald-900/20" onClick={finishSession}>
                        <Save className="w-4 h-4 mr-2" /> Finish
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

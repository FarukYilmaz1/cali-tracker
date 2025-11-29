import { Exercise } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle2, Lock, Trophy, ArrowRight, RotateCcw, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillRoadmapProps {
    exercise: Exercise | null;
    open: boolean;
    onClose: () => void;
    onStartSession: (exerciseId: string) => void;
}

export function SkillRoadmap({ exercise, open, onClose, onStartSession }: SkillRoadmapProps) {
    const { skillProgress, updateSkillProgress, resetSkillProgress } = useWorkoutStore();

    if (!exercise || !exercise.roadmap) return null;

    const currentLevel = skillProgress[exercise.id] || 1;

    // Calculate progress percentage
    const progressPercent = Math.round(((currentLevel - 1) / exercise.roadmap.length) * 100);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="bg-zinc-950/95 backdrop-blur-xl text-zinc-50 border-zinc-800 sm:max-w-xl max-h-[85vh] overflow-y-auto p-0 gap-0 shadow-2xl">

                {/* Header with Parallax-like feel */}
                <div className="relative overflow-hidden bg-zinc-900 border-b border-white/5 pb-6 pt-8 px-6">
                    <div className="absolute top-0 right-0 p-12 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                                {exercise.name}
                            </DialogTitle>
                            <p className="text-zinc-400 mt-2 text-sm max-w-[80%]">
                                Master this skill by progressing through the levels below.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-amber-500">{progressPercent}%</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Mastery</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        />
                    </div>
                </div>

                <div className="relative p-6 pb-12 bg-zinc-950">
                    {/* Vertical Line */}
                    <div className="absolute left-[2.85rem] top-6 bottom-12 w-0.5 bg-zinc-800" />

                    <div className="space-y-8">
                        {exercise.roadmap.map((step, index) => {
                            const isCompleted = step.level < currentLevel;
                            const isCurrent = step.level === currentLevel;
                            const isLocked = step.level > currentLevel;

                            return (
                                <motion.div
                                    key={step.level}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn("relative flex gap-6 group", isLocked && "opacity-40 grayscale")}
                                >
                                    {/* Icon Marker */}
                                    <div className={cn(
                                        "relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 transition-all duration-300 shadow-xl bg-zinc-950",
                                        isCompleted ? "border-emerald-500/50 text-emerald-500 group-hover:border-emerald-400" :
                                            isCurrent ? "border-amber-500 text-amber-500 scale-110 shadow-amber-900/20" :
                                                "border-zinc-800 text-zinc-600"
                                    )}>
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                                            isLocked ? <Lock className="w-5 h-5" /> :
                                                <span className="text-xl font-bold">{step.level}</span>}
                                    </div>

                                    {/* Content Card */}
                                    <div className={cn(
                                        "flex-1 p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                                        isCurrent ? "bg-zinc-900/60 border-amber-500/30 shadow-lg" : "bg-zinc-900/20 border-white/5"
                                    )}>
                                        {/* Active Indicator Glow */}
                                        {isCurrent && <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />}

                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <h3 className={cn("font-bold text-lg", isCurrent ? "text-amber-400" : "text-zinc-300")}>
                                                {step.name}
                                            </h3>
                                            {isCurrent && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">Current</span>}
                                        </div>

                                        <p className="text-zinc-400 text-sm mb-4 relative z-10">Goal: <span className="text-zinc-200 font-medium">{step.goal}</span></p>

                                        {/* Actions */}
                                        <div className="relative z-10">
                                            {isCurrent && (
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold h-10 shadow-lg shadow-amber-900/20"
                                                        onClick={() => {
                                                            onStartSession(exercise.id, step.level);
                                                            onClose();
                                                        }}
                                                    >
                                                        <ArrowRight className="w-4 h-4 mr-2" /> Train This Level
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white h-9 text-sm"
                                                        onClick={() => updateSkillProgress(exercise.id, currentLevel + 1)}
                                                    >
                                                        Mark as Mastered
                                                    </Button>
                                                </div>
                                            )}

                                            {isCompleted && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 -ml-2 h-8"
                                                    onClick={() => updateSkillProgress(exercise.id, step.level)}
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-2" /> Revert to here
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-12 pt-6 border-t border-white/5 flex justify-center">
                        <Button
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/10 text-xs uppercase tracking-widest"
                            onClick={() => {
                                if (confirm('Are you sure you want to reset all progress for this skill?')) {
                                    resetSkillProgress(exercise.id);
                                }
                            }}
                        >
                            <RotateCcw className="w-3 h-3 mr-2" /> Reset Skill Progress
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

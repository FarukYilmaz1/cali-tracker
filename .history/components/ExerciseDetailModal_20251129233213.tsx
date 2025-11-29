"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { EXERCISES } from '@/data/exercises';
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/types';
import { ChevronRight } from 'lucide-react';

interface Props {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onStartSession: (exerciseId: string) => void;
}

export function ExerciseDetailModal({ exercise, open, onClose, onStartSession }: Props) {
  const { history } = useWorkoutStore();

  if (!exercise) return null;

  const exHistory = history[exercise.id] || [];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-950/90 backdrop-blur-xl text-zinc-50 border-zinc-800 shadow-2xl p-0 gap-0 overflow-hidden">
        <div className="p-6">
          <DialogTitle className="text-2xl font-bold text-white tracking-tight">{exercise.name}</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm mt-1">Overview & recent activity</DialogDescription>

          <div className="mt-6 space-y-4">
            {exHistory.length > 0 ? (
              <div className="space-y-3">
                {exHistory.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                    <div>
                      <div className="font-bold text-zinc-200">{new Date(s.timestamp).toLocaleDateString()}</div>
                      <div className="text-xs text-zinc-400">{Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s • {s.sets.length} sets</div>
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {s.sets.map((st, i) => (
                        <div key={i} className="text-right">{st.reps}{st.weightOrTime ? ` • ${st.weightOrTime}` : ''}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
                <p className="text-zinc-400">No sessions yet for this exercise.</p>
                <p className="text-zinc-600 text-sm mt-1">Start a session to begin tracking progress.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800 h-12 rounded-xl" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-semibold" onClick={() => onStartSession(exercise.id)}>
              <ChevronRight className="w-4 h-4 mr-2" /> Start
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExerciseDetailModal;

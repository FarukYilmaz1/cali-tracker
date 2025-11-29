'use client';

import { useState, useEffect } from 'react';
import { EXERCISES } from '@/data/exercises';
import { useWorkoutStore } from '@/store/workoutStore';
import { ActiveSessionModal } from '@/components/ActiveSessionModal';
import { SkillRoadmap } from '@/components/SkillRoadmap';
import { ExerciseDetailModal } from '@/components/ExerciseDetailModal';
import { Button } from '@/components/ui/button';
import { Dumbbell, Trophy, Activity, ArrowLeft, ChevronRight, Play, Zap, BarChart3, TrendingUp } from 'lucide-react';
import { Exercise } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'Push' | 'Pull' | 'Elite'>('dashboard');
  const [selectedElite, setSelectedElite] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [mounted, setMounted] = useState(false);
  const { startSession, history, skillProgress } = useWorkoutStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExerciseClick = (exercise: Exercise) => {
    if (exercise.category === 'Elite') {
      setSelectedElite(exercise);
    } else {
      // Open a detail view for Push/Pull exercises so user can review progress before starting
      setSelectedExercise(exercise);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const recentSessions = Object.values(history).flat().sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  // --- Stats Calculation ---
  const getCategoryStats = (category: 'Push' | 'Pull') => {
    const categoryExerciseIds = EXERCISES.filter(e => e.category === category).map(e => e.id);
    const sessions = Object.values(history).flat().filter(s => categoryExerciseIds.includes(s.exerciseId));

    // Sessions in last 7 days
    const last7Days = sessions.filter(s => s.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
    // Total sessions
    const total = sessions.length;

    // "Level" based on total sessions (Gamification)
    const level = Math.floor(total / 5) + 1;

    return { last7Days, total, level };
  };

  const getEliteStats = () => {
    const eliteExercises = EXERCISES.filter(e => e.category === 'Elite');
    const totalLevels = eliteExercises.reduce((acc, ex) => acc + (ex.roadmap?.length || 0), 0);
    const currentLevels = eliteExercises.reduce((acc, ex) => acc + ((skillProgress[ex.id] || 1) - 1), 0);
    const percent = Math.round((currentLevels / totalLevels) * 100) || 0;
    return { percent, mastered: eliteExercises.filter(e => (skillProgress[e.id] || 1) > (e.roadmap?.length || 0)).length };
  };

  const pushStats = getCategoryStats('Push');
  const pullStats = getCategoryStats('Pull');
  const eliteStats = getEliteStats();

  // Identify "Weak Point" (Category with least activity in last 7 days)
  let weakPoint = 'None';
  if (pushStats.last7Days < pullStats.last7Days) weakPoint = 'Push';
  else if (pullStats.last7Days < pushStats.last7Days) weakPoint = 'Pull';

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/20 pb-20">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />

      <ActiveSessionModal />
      <ExerciseDetailModal
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onStartSession={(id) => {
          startSession(id);
          setSelectedExercise(null);
        }}
      />
      <SkillRoadmap
        exercise={selectedElite}
        open={!!selectedElite}
        onClose={() => setSelectedElite(null)}
        onStartSession={startSession}
      />

      <div className="relative max-w-6xl mx-auto p-6 md:p-12 space-y-12">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2"
            >
              CALI<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">TRACKER</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 font-medium tracking-wide uppercase text-sm"
            >
              Forging Elite Strength
            </motion.p>
          </div>

          {view !== 'dashboard' && (
            <Button
              variant="ghost"
              onClick={() => setView('dashboard')}
              className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full px-6 border border-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {/* Hero Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Weekly Focus</p>
                  <p className="text-2xl font-bold text-white">{weakPoint === 'None' ? 'Balanced' : <span className="text-red-400">{weakPoint}</span>}</p>
                </div>
                <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold text-white">{pushStats.total + pullStats.total}</p>
                </div>
                <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Elite Mastery</p>
                  <p className="text-2xl font-bold text-amber-400">{eliteStats.percent}%</p>
                </div>
                <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Athlete Level</p>
                  <p className="text-2xl font-bold text-emerald-400">Lvl {Math.max(pushStats.level, pullStats.level)}</p>
                </div>
              </motion.div>

              {/* Main Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Push Card - Large */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => setView('Push')}
                  className="md:col-span-6 group relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-white/5 p-8 cursor-pointer transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                >
                  <div className="absolute top-0 right-0 p-32 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-500" />

                  <div className="relative z-10 h-full flex flex-col justify-between min-h-[240px]">
                    <div className="flex justify-between items-start">
                      <div className="p-4 bg-zinc-950/50 border border-white/10 rounded-2xl backdrop-blur-md">
                        <Dumbbell className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-white">{pushStats.level}</span>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Level</p>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">PUSH</h2>
                      <div className="flex items-center gap-4 text-zinc-400 text-sm">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {pushStats.last7Days} sessions this week</span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[60%]" style={{ width: `${Math.min((pushStats.last7Days / 4) * 100, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1 text-right">Weekly Goal Progress</p>
                    </div>
                  </div>
                </motion.div>

                {/* Pull Card - Large */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => setView('Pull')}
                  className="md:col-span-6 group relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-white/5 p-8 cursor-pointer transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                >
                  <div className="absolute top-0 right-0 p-32 bg-emerald-600/10 blur-[100px] rounded-full group-hover:bg-emerald-600/20 transition-all duration-500" />

                  <div className="relative z-10 h-full flex flex-col justify-between min-h-[240px]">
                    <div className="flex justify-between items-start">
                      <div className="p-4 bg-zinc-950/50 border border-white/10 rounded-2xl backdrop-blur-md">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-white">{pullStats.level}</span>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Level</p>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">PULL</h2>
                      <div className="flex items-center gap-4 text-zinc-400 text-sm">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {pullStats.last7Days} sessions this week</span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[60%]" style={{ width: `${Math.min((pullStats.last7Days / 4) * 100, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1 text-right">Weekly Goal Progress</p>
                    </div>
                  </div>
                </motion.div>

                {/* Elite Card - Full Width */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => setView('Elite')}
                  className="md:col-span-12 group relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-white/5 p-8 cursor-pointer transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-transparent opacity-50" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="p-5 bg-zinc-950/50 border border-white/10 rounded-2xl backdrop-blur-md shrink-0">
                        <Trophy className="w-10 h-10 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">ELITE SKILLS</h2>
                        <p className="text-zinc-400">Unlock advanced calisthenics moves.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="flex-1 md:flex-none">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-zinc-400">Mastery Progress</span>
                          <span className="text-amber-400 font-bold">{eliteStats.percent}%</span>
                        </div>
                        <div className="h-2 w-full md:w-64 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${eliteStats.percent}%` }} />
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-2xl font-bold text-white">{eliteStats.mastered}</p>
                        <p className="text-xs text-zinc-500 uppercase">Skills Mastered</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity List */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-bold text-zinc-200">Recent Activity</h2>
                  <Button variant="link" className="text-zinc-500 hover:text-white">View All</Button>
                </div>

                {recentSessions.length > 0 ? (
                  <div className="grid gap-3">
                    {recentSessions.map((session, i) => {
                      const ex = EXERCISES.find(e => e.id === session.exerciseId);
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-900/20 border border-white/5 hover:bg-zinc-900/60 hover:border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                              ex?.category === 'Push' ? "bg-blue-500/10 text-blue-400" :
                                ex?.category === 'Pull' ? "bg-emerald-500/10 text-emerald-400" :
                                  "bg-amber-500/10 text-amber-400"
                            )}>
                              <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                              <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{ex?.name || 'Unknown Exercise'}</p>
                              <p className="text-xs text-zinc-500 font-mono">{new Date(session.timestamp).toLocaleDateString()} • {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-sm font-medium text-zinc-300">{session.sets.length} Sets</p>
                              <p className="text-xs text-zinc-600">Volume</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 rounded-[2rem] bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
                    <Dumbbell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No recent activity.</p>
                    <p className="text-zinc-600 text-sm mt-1">Start a session to see your stats grow.</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex items-end gap-4 mb-8 pl-2 border-b border-white/5 pb-6">
                <h2 className="text-4xl font-black text-white tracking-tight uppercase">{view === 'Elite' ? 'Elite Skills' : `${view} Day`}</h2>
                <span className="text-zinc-500 pb-2 text-lg font-medium font-mono">
                  // {EXERCISES.filter(e => e.category === view).length} EXERCISES
                </span>
              </div>

              <div className="grid gap-3">
                {EXERCISES.filter(e => e.category === view).map((exercise, index) => {
                  const isElite = exercise.category === 'Elite';
                  const eliteLevel = isElite ? (skillProgress[exercise.id] || 1) : 0;
                  const maxLevel = exercise.roadmap?.length || 0;
                  const isMastered = eliteLevel > maxLevel;

                  return (
                    <motion.div
                      key={exercise.id}
                      variants={itemVariants}
                      onClick={() => handleExerciseClick(exercise)}
                      className="group relative overflow-hidden bg-zinc-900/20 border border-white/5 p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-zinc-900/50 hover:border-white/10 transition-all active:scale-[0.99]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative z-10 flex items-center gap-6">
                        <span className="text-zinc-700 font-mono text-xl font-bold w-8">{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <span className="font-bold text-xl text-zinc-200 group-hover:text-white transition-colors block">{exercise.name}</span>
                          {isElite && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${Math.min(((eliteLevel - 1) / maxLevel) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-zinc-500 font-mono">
                                {isMastered ? 'MASTERED' : `LVL ${eliteLevel} / ${maxLevel}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/20">
                        {isMastered ? <Trophy className="w-5 h-5 text-amber-500" /> : <Play className="w-4 h-4 text-zinc-400 group-hover:text-white ml-0.5" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

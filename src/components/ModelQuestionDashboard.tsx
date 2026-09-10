import React, { useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Clock,
  Sparkles,
  Trophy,
  Settings,
  LogOut,
  User,
  Play,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { ModelQuestionSet, StudentProfile, ScoreRecord, QuizSettings } from '../types';
import { HeaderClock } from './HeaderClock';
import { Footer } from './Footer';
import { soundManager } from '../utils/sound';

interface ModelQuestionCardProps {
  modelSet: ModelQuestionSet;
  idx: number;
  totalSets: number;
  bestScore: number | null;
  enableTotalTimer: boolean;
  totalTimeMinutes: number;
  soundEffects: boolean;
  onSelect: (modelId: number) => void;
}

// Memoized individual model question card to prevent re-rendering all 20 cards on state changes
const ModelQuestionCard = React.memo<ModelQuestionCardProps>(({
  modelSet,
  idx,
  totalSets,
  bestScore,
  enableTotalTimer,
  totalTimeMinutes,
  soundEffects,
  onSelect,
}) => {
  const handleStart = useCallback(() => {
    if (soundEffects) soundManager.playClick();
    onSelect(modelSet.id);
  }, [soundEffects, onSelect, modelSet.id]);

  const gradientClasses = useMemo(() => {
    const mod = idx % 5;
    if (mod === 0) return 'from-teal-400 to-cyan-500';
    if (mod === 1) return 'from-cyan-500 to-blue-500';
    if (mod === 2) return 'from-blue-500 to-purple-500';
    if (mod === 3) return 'from-purple-500 to-pink-500';
    return 'from-amber-400 to-rose-500';
  }, [idx]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
      className="group relative rounded-2xl sm:rounded-3xl bg-[#0F172A]/90 hover:bg-[#1E3A8A]/25 backdrop-blur-xl border border-blue-500/30 hover:border-cyan-400/80 p-4 sm:p-6 shadow-lg hover:shadow-[0_0_30px_rgba(30,58,138,0.4)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Accent Top Gradient */}
      <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${gradientClasses}`} />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            SET {modelSet.id} OF {totalSets}
          </span>

          {bestScore !== null ? (
            <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 sm:px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Best: {bestScore}%
            </span>
          ) : (
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Not taken yet</span>
          )}
        </div>

        <h4 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-cyan-300 transition tracking-tight">
          {modelSet.title}
        </h4>
        <p className="text-xs font-semibold text-cyan-400/90 mt-0.5">
          {modelSet.subtitle}
        </p>

        <p className="text-xs text-slate-300/80 mt-2.5 sm:mt-3 line-clamp-2 leading-relaxed">
          {modelSet.description}
        </p>

        {/* Highlights list */}
        <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800/80 space-y-1.5 sm:space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Questions:</span>
            <strong className="text-white font-mono font-bold">25 MCQs</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Duration:</span>
            <strong className="text-cyan-300 font-mono">
              {enableTotalTimer ? `${totalTimeMinutes} Mins` : 'Unlimited'}
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Explanations:</span>
            <span className="text-emerald-400 font-semibold">Included for all 25</span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        id={`start-model-${modelSet.id}-btn`}
        type="button"
        onClick={handleStart}
        className="mt-5 sm:mt-6 w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-slate-950" />
        <span>Start {modelSet.title}</span>
      </button>
    </motion.div>
  );
});

ModelQuestionCard.displayName = 'ModelQuestionCard';

interface ModelQuestionDashboardProps {
  questionSets: ModelQuestionSet[];
  studentProfile: StudentProfile;
  scoreRecords: ScoreRecord[];
  settings: QuizSettings;
  onSelectModel: (modelId: number) => void;
  onOpenScoreBoard: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const ModelQuestionDashboard = React.memo<ModelQuestionDashboardProps>(({
  questionSets,
  studentProfile,
  scoreRecords,
  settings,
  onSelectModel,
  onOpenScoreBoard,
  onOpenSettings,
  onOpenProfile,
  onLogout,
}) => {
  // Precompute highest score per model in an O(1) Map to avoid running filters on every card render
  const bestScoresMap = useMemo(() => {
    const map = new Map<number, number>();
    for (let i = 0; i < scoreRecords.length; i++) {
      const record = scoreRecords[i];
      const prev = map.get(record.modelNumber);
      if (prev === undefined || record.percentage > prev) {
        map.set(record.modelNumber, record.percentage);
      }
    }
    return map;
  }, [scoreRecords]);

  const { totalAttempts, avgScore } = useMemo(() => {
    const count = scoreRecords.length;
    const avg =
      count > 0
        ? Math.round(scoreRecords.reduce((sum, r) => sum + r.percentage, 0) / count)
        : 0;
    return { totalAttempts: count, avgScore: avg };
  }, [scoreRecords]);

  const totalQuestionsAllSets = useMemo(
    () => questionSets.reduce((sum, s) => sum + s.totalQuestions, 0),
    [questionSets]
  );

  // Memoized action handlers with audio feedback
  const handleScoreBoardClick = useCallback(() => {
    if (settings.soundEffects) soundManager.playClick();
    onOpenScoreBoard();
  }, [settings.soundEffects, onOpenScoreBoard]);

  const handleSettingsClick = useCallback(() => {
    if (settings.soundEffects) soundManager.playClick();
    onOpenSettings();
  }, [settings.soundEffects, onOpenSettings]);

  const handleLogoutClick = useCallback(() => {
    if (settings.soundEffects) soundManager.playClick();
    onLogout();
  }, [settings.soundEffects, onLogout]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between text-slate-100 z-10">
      {/* Top Navigation Bar */}
      <header className="relative z-30 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 bg-[#0F172A]/90 backdrop-blur-xl border-b border-blue-500/25 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-slate-950 flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <h1 className="text-sm xs:text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              <span>MCQ from all Grammar Points</span>
            </h1>
            <p className="text-[10px] xs:text-xs text-cyan-300 font-medium line-clamp-1 xs:line-clamp-none">
              English Grammar Model Test Practice Series
            </p>
          </div>
        </div>

        {/* Right Section: Student Pill, Digital Clock, & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
          {/* Student Profile Pill */}
          <button
            id="student-profile-badge"
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-200 hover:border-cyan-400 transition shadow-sm shrink-0 cursor-pointer"
            title="Click to edit Name and Roll"
          >
            <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-white leading-tight flex items-center gap-1">
                <span className="max-w-[85px] xs:max-w-[120px] sm:max-w-none truncate">{studentProfile.name}</span>
                <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-cyan-300">
                Roll: <span className="font-mono font-bold text-white">{studentProfile.roll}</span>
              </div>
            </div>
          </button>

          {/* Clock Widget */}
          <HeaderClock />

          {/* Action Buttons */}
          <button
            id="nav-scoreboard-btn"
            type="button"
            onClick={handleScoreBoardClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Score Board</span>
          </button>

          <button
            id="nav-settings-btn"
            type="button"
            onClick={handleSettingsClick}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition shrink-0 cursor-pointer"
            title="Smart & Modern Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="nav-logout-btn"
            type="button"
            onClick={handleLogoutClick}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition shrink-0 cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Welcome Banner Card */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-950/90 via-slate-900/85 to-cyan-950/80 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] sm:text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prepared for Competitive Exams, Primary & Higher English</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-cyan-300">{studentProfile.name}</span>!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Select any Model Question below. Each test includes <strong>25 high-yield MCQs</strong> with
              configurable total time & per-question time, instant result analysis, voice read-out, and detailed grammatical explanations.
            </p>
          </div>

          {/* Quick Performance Metrics */}
          <div className="flex items-center justify-around sm:justify-center gap-3 sm:gap-4 bg-slate-900/90 border border-slate-700/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 shrink-0 shadow-inner">
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">{totalAttempts}</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tests Taken
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {avgScore}%
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Avg. Score
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Choose a Model Question</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {questionSets.length} Sets Available
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {totalQuestionsAllSets} comprehensive questions curated with grammatical breakdowns
            </p>
          </div>

          {/* Timer status badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
            <span>
              Total: <strong>{settings.enableTotalTimer ? `${settings.totalTimeMinutes}m` : 'Off'}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Per-MCQ: <strong>{settings.enableQuestionTimer ? `${settings.questionTimeSeconds}s` : 'Off'}</strong>
            </span>
          </div>
        </div>

        {/* Grid of 20 Model Question Cards with React.memo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {questionSets.map((modelSet, idx) => (
            <ModelQuestionCard
              key={modelSet.id}
              modelSet={modelSet}
              idx={idx}
              totalSets={questionSets.length}
              bestScore={bestScoresMap.get(modelSet.id) ?? null}
              enableTotalTimer={settings.enableTotalTimer}
              totalTimeMinutes={settings.totalTimeMinutes}
              soundEffects={settings.soundEffects}
              onSelect={onSelectModel}
            />
          ))}
        </div>
      </main>

      {/* Modern Colorful Footer */}
      <Footer />
    </div>
  );
});

ModelQuestionDashboard.displayName = 'ModelQuestionDashboard';

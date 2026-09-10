import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  Filter,
  Check,
  Award,
  ArrowRight,
} from 'lucide-react';
import { ModelQuestionSet, QuizSettings, StudentProfile, ScoreRecord } from '../types';
import { speechManager } from '../utils/speech';
import { soundManager } from '../utils/sound';
import { HeaderClock } from './HeaderClock';
import { Footer } from './Footer';

interface ResultViewProps {
  modelSet: ModelQuestionSet;
  userAnswers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  timeSpentSeconds: number;
  studentProfile: StudentProfile;
  settings: QuizSettings;
  onRetake: () => void;
  onReturnToDashboard: () => void;
  onOpenScoreBoard: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  modelSet,
  userAnswers,
  timeSpentSeconds,
  studentProfile,
  settings,
  onRetake,
  onReturnToDashboard,
  onOpenScoreBoard,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'wrong'>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Compute performance metrics
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  modelSet.questions.forEach((q) => {
    const ans = userAnswers[q.id];
    if (!ans) {
      unansweredCount++;
    } else if (ans === q.correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const totalQuestions = modelSet.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Praising words and phrases based on score
  let praisePhrase = '';
  let praiseSpeech = '';
  if (percentage >= 90) {
    praisePhrase = 'Outstanding Brilliance! Phenomenal Mastery of English Grammar!';
    praiseSpeech = `Tremendous accomplishment, ${studentProfile.name}! You scored ${correctCount} out of ${totalQuestions} with ${percentage} percent accuracy! Your grammatical reasoning is truly phenomenal!`;
  } else if (percentage >= 75) {
    praisePhrase = 'Excellent Achievement! Strong & Confident Grasp of Concepts!';
    praiseSpeech = `Congratulations ${studentProfile.name}! You scored ${correctCount} right answers and ${wrongCount} wrong answers. Great job on this model question!`;
  } else if (percentage >= 50) {
    praisePhrase = 'Good Effort! Solid foundation, keep refining your skills!';
    praiseSpeech = `Good work ${studentProfile.name}! You answered ${correctCount} out of ${totalQuestions} correctly. Reviewing the explanations will help you master every rule!`;
  } else {
    praisePhrase = 'Keep Practicing! Every mistake is a step toward perfection!';
    praiseSpeech = `Courageous attempt ${studentProfile.name}. You got ${correctCount} correct and ${wrongCount} wrong. Thoroughly read each grammatical explanation below to build confidence!`;
  }

  // Trigger colorful congratulations effect & read aloud on mount
  useEffect(() => {
    // 1. Play celebration fanfare sound
    if (settings.soundEffects) {
      soundManager.playCelebration();
    }

    // 2. Multi-stage colorful confetti fireworks
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#22d3ee', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // 3. Read aloud score, right/wrong count and praising phrases
    if (settings.enableSpeech) {
      setIsSpeaking(true);
      speechManager.speak(
        praiseSpeech,
        {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
          volume: settings.speechVolume,
        },
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }

    return () => {
      speechManager.stop();
    };
  }, []);

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechManager.speak(
        praiseSpeech,
        {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
          volume: settings.speechVolume,
        },
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const filteredQuestions = modelSet.questions.filter((q) => {
    const ans = userAnswers[q.id];
    if (filterType === 'correct') return ans === q.correctAnswer;
    if (filterType === 'wrong') return ans !== q.correctAnswer;
    return true;
  });

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="relative min-h-screen flex flex-col justify-between text-slate-100 z-10">
      {/* Top Header */}
      <header className="relative z-30 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 bg-[#0F172A]/90 backdrop-blur-xl border-b border-blue-500/25 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-base font-extrabold text-white tracking-tight">
              Test Evaluation & Score Report
            </h1>
            <p className="text-[10px] sm:text-xs text-cyan-300 truncate max-w-[200px] xs:max-w-[300px] sm:max-w-none">
              {modelSet.title} • Candidate: <strong>{studentProfile.name}</strong> (Roll: {studentProfile.roll})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            type="button"
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden xs:inline">{isSpeaking ? 'Stop Voice' : 'Read Aloud'}</span>
          </button>

          <HeaderClock />
        </div>
      </header>

      {/* Main Content: Congratulations Hero Card & Explanation List */}
      <main className="relative z-20 flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Colorful Congratulations Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0F172A]/95 via-[#1E3A8A]/30 to-[#0F172A]/90 backdrop-blur-2xl border-2 border-cyan-400/50 p-4 sm:p-7 md:p-9 shadow-[0_0_60px_rgba(30,58,138,0.4)] relative overflow-hidden mb-6 sm:mb-8 text-center"
        >
          {/* Shimmer background flare */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Trophy & Congratulating Header */}
          <div className="inline-flex p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.6)] mb-3 sm:mb-4 animate-bounce">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="inline-block px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2">
            Assessment Completed
          </div>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            {praisePhrase}
          </h2>

          <p className="text-xs sm:text-base text-cyan-200 font-medium max-w-2xl mx-auto mt-2 leading-relaxed">
            Candidate <strong className="text-white font-bold">{studentProfile.name}</strong> (Roll{' '}
            <strong className="text-white font-mono">{studentProfile.roll}</strong>) completed{' '}
            <strong className="text-white">{modelSet.title}</strong> in {timeFormatted}.
          </p>

          {/* Score Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto mt-5 sm:mt-7">
            {/* Total Score Percentage */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-inner">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                Score
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono mt-0.5 sm:mt-1">
                {percentage}%
              </div>
              <div className="text-[10px] sm:text-[11px] text-cyan-400 font-semibold mt-0.5">
                {correctCount} / {totalQuestions}
              </div>
            </div>

            {/* Right Answers */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-950/70 border border-emerald-500/40 shadow-inner">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Right
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5 sm:mt-1">
                {correctCount}
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-300/80 font-medium mt-0.5">
                Correct Answers
              </div>
            </div>

            {/* Wrong Answers */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-950/70 border border-rose-500/40 shadow-inner">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Wrong
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mt-0.5 sm:mt-1">
                {wrongCount}
              </div>
              <div className="text-[10px] sm:text-[11px] text-rose-300/80 font-medium mt-0.5">
                Incorrect Answers
              </div>
            </div>

            {/* Time Taken */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-inner">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Duration
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5 sm:mt-1">
                {timeFormatted}
              </div>
              <div className="text-[10px] sm:text-[11px] text-amber-400/80 font-medium mt-0.5">
                {unansweredCount > 0 ? `${unansweredCount} Skipped` : 'All Attempted'}
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-5 sm:mt-7 pt-5 sm:pt-6 border-t border-slate-800">
            <button
              id="result-retake-btn"
              onClick={() => {
                if (settings.soundEffects) soundManager.playClick();
                onRetake();
              }}
              className="w-full xs:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>

            <button
              id="result-view-scoreboard-btn"
              onClick={() => {
                if (settings.soundEffects) soundManager.playClick();
                onOpenScoreBoard();
              }}
              className="w-full xs:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Permanent Score Board</span>
            </button>

            <button
              id="result-dashboard-btn"
              onClick={() => {
                if (settings.soundEffects) soundManager.playClick();
                onReturnToDashboard();
              }}
              className="w-full xs:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 text-xs sm:text-sm font-black hover:brightness-110 transition shadow-lg shadow-cyan-500/30 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>All Model Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Detailed Question Review & Grammatical Explanations (Required) */}
        <div className="space-y-4 sm:space-y-5">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-cyan-500/20">
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Detailed Question Review</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {filteredQuestions.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Grammatical rules and correct answer breakdowns for all 25 MCQs
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All (25)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('correct')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'correct'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('wrong')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'wrong'
                    ? 'bg-rose-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wrong ({wrongCount})
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              const isSkipped = !userAns;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 transition bg-[#0F172A]/90 backdrop-blur-xl ${
                    isCorrect
                      ? 'border-emerald-500/40 hover:border-emerald-400'
                      : isSkipped
                      ? 'border-blue-900/40'
                      : 'border-rose-500/40 hover:border-rose-400'
                  }`}
                >
                  {/* Question header row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-[11px] sm:text-xs border border-slate-700">
                        Q{q.id}
                      </span>
                      <span
                        className={`text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isSkipped
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Correct (+1)
                          </>
                        ) : isSkipped ? (
                          'Skipped (0)'
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-semibold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30">
                      {q.topic}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 leading-relaxed">
                    {q.question}
                  </h4>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 sm:mb-4 text-xs">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const isUserChoice = userAns === optKey;
                      const isCorrectChoice = q.correctAnswer === optKey;

                      let badgeStyle = 'bg-slate-950/60 border-slate-800 text-slate-300';
                      if (isCorrectChoice) {
                        badgeStyle = 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 font-semibold';
                      } else if (isUserChoice && !isCorrectChoice) {
                        badgeStyle = 'bg-rose-950/80 border-rose-500/60 text-rose-200 line-through';
                      }

                      return (
                        <div
                          key={optKey}
                          className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 ${badgeStyle}`}
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-800/80 font-mono font-black flex items-center justify-center text-[10px] sm:text-[11px] shrink-0">
                              {optKey}
                            </span>
                            <span className="truncate sm:whitespace-normal">{q.options[optKey]}</span>
                          </div>

                          {isCorrectChoice && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider shrink-0 ml-1">
                              Correct
                            </span>
                          )}
                          {isUserChoice && !isCorrectChoice && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider shrink-0 ml-1">
                              Your Pick
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Grammatical Explanation Box (Required) */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs leading-relaxed text-slate-300 flex items-start gap-2 sm:gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 font-bold block mb-0.5 text-xs">
                        Grammar Explanation:
                      </strong>
                      <p className="text-[11px] sm:text-xs text-slate-300/90 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

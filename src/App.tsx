import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LoginPage } from './components/LoginPage';
import { ModelQuestionDashboard } from './components/ModelQuestionDashboard';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { AquariumBackground } from './components/AquariumBackground';
import { SettingsModal } from './components/SettingsModal';
import { ScoreBoardModal } from './components/ScoreBoardModal';
import { StudentInfoModal } from './components/StudentInfoModal';
import { modelQuestionSets } from './data/questions';
import { QuizSettings, StudentProfile, ScoreRecord } from './types';
import { soundManager } from './utils/sound';

const DEFAULT_SETTINGS: QuizSettings = {
  enableSpeech: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  soundEffects: true,
  ambientSound: false,
  enableTotalTimer: true,
  totalTimeMinutes: 20,
  enableQuestionTimer: true,
  questionTimeSeconds: 45,
  autoAdvanceOnAnswer: true,
  enableAquariumAnimation: true,
  aquariumFishCount: 12,
  aquariumFlowerCount: 8,
  showExplanationInQuiz: false,
  enablePasswordExpiry: false,
  passwordExpiryMinutes: 60,
  isManuallyExpired: false,
};

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Md. Ismail Student',
  roll: '01',
};

export default function App() {
  // Session & Navigation States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'quiz' | 'result'>('dashboard');
  const [activeModelId, setActiveModelId] = useState<number>(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizTimeSpent, setQuizTimeSpent] = useState<number>(0);

  // Settings State with LocalStorage Persistence
  const [settings, setSettings] = useState<QuizSettings>(() => {
    try {
      const saved = localStorage.getItem('asgk_quiz_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Student Profile State
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('asgk_student_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Permanent Scoreboard State
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('asgk_permanent_scoreboard');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScoreBoardOpen, setIsScoreBoardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync settings
  useEffect(() => {
    try {
      localStorage.setItem('asgk_quiz_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  // Sync student profile
  useEffect(() => {
    try {
      localStorage.setItem('asgk_student_profile', JSON.stringify(studentProfile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }, [studentProfile]);

  // Sync permanent scoreboard
  useEffect(() => {
    try {
      localStorage.setItem('asgk_permanent_scoreboard', JSON.stringify(scoreRecords));
    } catch (e) {
      console.warn('Failed to save scores:', e);
    }
  }, [scoreRecords]);

  const updateSettings = useCallback((newPartial: Partial<QuizSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    soundManager.stopAmbientAquarium();
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    setUserAnswers({});
    setQuizTimeSpent(0);
    if (settings.ambientSound) {
      soundManager.startAmbientAquarium();
    }
  }, [settings.ambientSound]);

  const handleSelectModel = useCallback((modelId: number) => {
    setActiveModelId(modelId);
    setUserAnswers({});
    setQuizTimeSpent(0);
    setCurrentView('quiz');
  }, []);

  const handleCheckAnswer = useCallback((
    answers: Record<number, 'A' | 'B' | 'C' | 'D'>,
    timeSpent: number
  ) => {
    setUserAnswers(answers);
    setQuizTimeSpent(timeSpent);

    const activeSet = modelQuestionSets.find((m) => m.id === activeModelId) || modelQuestionSets[0];
    let correct = 0;
    activeSet.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const total = activeSet.questions.length;
    const percentage = Math.round((correct / total) * 100);

    // Save to permanent scoreboard
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRecord: ScoreRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userName: studentProfile.name,
      roll: studentProfile.roll,
      modelNumber: activeModelId,
      modelTitle: activeSet.title,
      score: correct,
      totalQuestions: total,
      percentage,
      timeSpentSeconds: timeSpent,
      date: formattedDate,
    };

    setScoreRecords((prev) => [newRecord, ...prev]);
    setCurrentView('result');
  }, [activeModelId, studentProfile.name, studentProfile.roll]);

  const handleClearScores = useCallback(() => {
    setScoreRecords([]);
    try {
      localStorage.removeItem('asgk_permanent_scoreboard');
    } catch {}
  }, []);

  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);
  const handleOpenScoreBoard = useCallback(() => setIsScoreBoardOpen(true), []);
  const handleCloseScoreBoard = useCallback(() => setIsScoreBoardOpen(false), []);
  const handleOpenProfile = useCallback(() => setIsProfileOpen(true), []);
  const handleCloseProfile = useCallback(() => setIsProfileOpen(false), []);
  const handleExitQuiz = useCallback(() => setCurrentView('dashboard'), []);
  const handleRetake = useCallback(() => {
    setUserAnswers({});
    setQuizTimeSpent(0);
    setCurrentView('quiz');
  }, []);
  const handleReturnToDashboard = useCallback(() => setCurrentView('dashboard'), []);
  const handleSaveProfile = useCallback((p: StudentProfile) => setStudentProfile(p), []);

  const activeModelSet = useMemo(
    () => modelQuestionSets.find((m) => m.id === activeModelId) || modelQuestionSets[0],
    [activeModelId]
  );

  return (
    <div
      className={`relative min-h-screen text-slate-100 selection:bg-cyan-500 selection:text-white flex flex-col font-sans transition-colors duration-500 ${
        isLoggedIn
          ? 'bg-[#0F172A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E3A8A] via-[#0F172A] to-[#080d1a]'
          : 'bg-slate-950'
      }`}
    >
      {/* 1. Animated Colorful Aquarium Background (Active ONLY BEFORE login as requested) */}
      {!isLoggedIn && settings.enableAquariumAnimation && (
        <AquariumBackground
          fishCount={settings.aquariumFishCount}
          flowerCount={settings.aquariumFlowerCount}
          showOverlay={true}
        />
      )}

      {/* 2. Page Routing */}
      {!isLoggedIn ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          settings={settings}
          onUpdateSettings={updateSettings}
          onOpenSettings={handleOpenSettings}
        />
      ) : currentView === 'dashboard' ? (
        <ModelQuestionDashboard
          questionSets={modelQuestionSets}
          studentProfile={studentProfile}
          scoreRecords={scoreRecords}
          settings={settings}
          onSelectModel={handleSelectModel}
          onOpenScoreBoard={handleOpenScoreBoard}
          onOpenSettings={handleOpenSettings}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
        />
      ) : currentView === 'quiz' ? (
        <QuizView
          modelSet={activeModelSet}
          settings={settings}
          studentProfile={studentProfile}
          onCheckAnswer={handleCheckAnswer}
          onExitQuiz={handleExitQuiz}
          onOpenSettings={handleOpenSettings}
          onUpdateSettings={updateSettings}
        />
      ) : (
        <ResultView
          modelSet={activeModelSet}
          userAnswers={userAnswers}
          timeSpentSeconds={quizTimeSpent}
          studentProfile={studentProfile}
          settings={settings}
          onRetake={handleRetake}
          onReturnToDashboard={handleReturnToDashboard}
          onOpenScoreBoard={handleOpenScoreBoard}
        />
      )}

      {/* 3. Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />

      <ScoreBoardModal
        isOpen={isScoreBoardOpen}
        onClose={handleCloseScoreBoard}
        scores={scoreRecords}
        onClearScores={handleClearScores}
      />

      <StudentInfoModal
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        currentProfile={studentProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

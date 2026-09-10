import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  X,
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  User,
  Hash,
  Award,
  Clock,
  Printer,
} from 'lucide-react';
import { ScoreRecord } from '../types';

interface ScoreBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: ScoreRecord[];
  onClearScores: () => void;
}

export const ScoreBoardModal: React.FC<ScoreBoardModalProps> = ({
  isOpen,
  onClose,
  scores,
  onClearScores,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<number | 'all'>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  // Filter scores
  const filteredScores = scores.filter((rec) => {
    const matchesModel = selectedModel === 'all' || rec.modelNumber === selectedModel;
    const matchesSearch =
      rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.roll.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModel && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (scores.length === 0) return;
    const headers = 'ID,Name,Roll,Model Question,Score,Total,Percentage,Duration (Seconds),Date\n';
    const rows = scores
      .map(
        (s) =>
          `"${s.id}","${s.userName}","${s.roll}","${s.modelTitle}",${s.score},${s.totalQuestions},${s.percentage}%,${s.timeSpentSeconds},"${s.date}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Permanent_Score_Board_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#0F172A] border border-blue-500/40 shadow-[0_0_50px_rgba(30,58,138,0.4)] text-white overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 lg:p-6 border-b border-blue-500/25 flex items-center justify-between gap-2.5 sm:gap-4 bg-[#0B132B]/90">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-xl font-black text-white tracking-tight">
                Permanent Score Board
              </h3>
              <p className="text-[10px] sm:text-xs text-cyan-300 truncate max-w-[190px] xs:max-w-[280px] sm:max-w-none">
                Persistent track record of student practice attempts and scores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
              title="Print Score Sheet"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={scores.length === 0}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition disabled:opacity-40 cursor-pointer"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Student Name or Roll..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Model Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedModel('all')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
                selectedModel === 'all'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Sets
            </button>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedModel(m)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
                  selectedModel === m
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Set {m}
              </button>
            ))}
          </div>

          {/* Clear history button */}
          {scores.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Scores Table List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredScores.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
              <h4 className="text-base font-bold text-slate-300">No score records found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Take any Model Question test and click "Check Answer" to permanently record your scores here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll</th>
                    <th className="py-2.5 px-3">Model Question</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredScores.map((rec) => {
                    const isHigh = rec.percentage >= 80;
                    return (
                      <tr
                        key={rec.id}
                        className="hover:bg-slate-850/60 transition font-medium text-slate-200"
                      >
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {rec.date}
                        </td>
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          {rec.userName}
                        </td>
                        <td className="py-3 px-3 font-mono text-cyan-300 whitespace-nowrap">
                          {rec.roll}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 font-semibold text-[11px]">
                            {rec.modelTitle}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                          <span className={isHigh ? 'text-emerald-400' : 'text-amber-400'}>
                            {rec.score} / {rec.totalQuestions}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              isHigh
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {rec.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {Math.floor(rec.timeSpentSeconds / 60)}m {rec.timeSpentSeconds % 60}s
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Total Entries: <strong className="text-white font-mono">{filteredScores.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold transition"
          >
            Close
          </button>
        </div>
      </motion.div>

      {/* Confirmation to clear */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-rose-500/40 text-white shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2">Clear Permanent Scores?</h4>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              This will permanently delete all recorded quiz results from your browser storage. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearScores();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

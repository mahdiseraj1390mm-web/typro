'use client';

import React, { useState } from 'react';
import { 
  BADGE_STAGES, 
  getFullLevelProgress, 
  REALM_NAMES_FA, 
  XP_PER_LEVEL, 
  MAX_LEVEL, 
  TOTAL_STAGES, 
  LEVELS_PER_STAGE,
  BadgeStage 
} from '@/lib/levelTiers';
import GamingLevelBadge from '@/components/common/GamingLevelBadge';
import { X, Sparkles, Trophy, Star, Shield, Lock, CheckCircle2, ChevronLeft, ChevronRight, Layers, Flame } from 'lucide-react';

interface LevelShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentXp: number;
}

export default function LevelShowcaseModal({
  isOpen,
  onClose,
  currentXp,
}: LevelShowcaseModalProps) {
  const [selectedRealm, setSelectedRealm] = useState<number>(0);

  if (!isOpen) return null;

  const progress = getFullLevelProgress(currentXp);
  const currentStageId = progress.stage.id;

  // 50 stages per realm for maximum performance and zero lag
  const realmStages = BADGE_STAGES.filter((s) => s.realmIdx === selectedRealm);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Ambient Aura */}
        <div
          className="absolute top-0 right-1/4 w-96 h-28 blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: progress.stage.borderColor }}
        />

        {/* Modal Header (White Theme) */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>تالار تکامل ۵۰۰ رتبه رسمی تایپرو</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                  ۱ تا ۱,۰۰۰,۰۰۰ لول
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ۵۰۰ نشان سه‌بعدی متالیک • هر ۱۰۰ امتیاز = ۱ لول • هر ۲,۰۰۰ لول = ۱ نشان جدید
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-200"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Status & Progress Card (Clean White Aesthetic) */}
        <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GamingLevelBadge level={progress.level} size="lg" showStars={true} showTierName={false} />
              <div>
                <div className="text-xs text-slate-400 font-bold">وضعیت کنونی شما:</div>
                <div className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <span style={{ color: progress.stage.color }}>{progress.stage.nameFa}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-sans">امتیاز کل: </span>
                <span className="text-amber-600 font-black">{(progress.currentXp ?? progress.xp ?? 0).toLocaleString('fa-IR')} XP</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-sans">تا لول بعدی: </span>
                <span className="text-emerald-600 font-black">
                  {progress.isMaxLevel ? 'حداکثر لول' : `${progress.nextLevelXp} XP`}
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>پیشرفت لول {progress.level.toLocaleString('fa-IR')}</span>
              <span className="font-mono text-blue-600 font-black">{progress.progressPercent}٪</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 10 Grand Realms Tab Selector */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-white shrink-0 overflow-x-auto flex items-center gap-1.5 custom-scrollbar">
          {REALM_NAMES_FA.map((realmName, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRealm(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedRealm === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{idx + 1}. {realmName}</span>
              <span className="text-[10px] opacity-75 font-mono">({(idx * 50) + 1}-{(idx + 1) * 50})</span>
            </button>
          ))}
        </div>

        {/* 50 Stages in Selected Realm (Pure 3D Crests without Black Box) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 bg-slate-50/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {realmStages.map((stage) => {
              const isCurrent = stage.id === currentStageId;
              const isUnlocked = progress.level >= stage.minLevel;

              return (
                <div
                  key={stage.id}
                  style={{
                    borderColor: isCurrent ? stage.borderColor : (isUnlocked ? stage.borderColor : `${stage.borderColor}40`),
                    boxShadow: isCurrent 
                      ? `0 0 20px ${stage.glowColor}` 
                      : (isUnlocked ? `0 4px 14px ${stage.glowColor}` : undefined),
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center justify-between gap-2.5 relative overflow-hidden ${
                    isCurrent
                      ? `bg-gradient-to-b ${stage.bgGradient} ring-2 ring-offset-2 ring-blue-500 scale-[1.03] shadow-lg`
                      : isUnlocked
                      ? `bg-gradient-to-b ${stage.bgGradient} hover:scale-[1.02] shadow-sm`
                      : `bg-slate-50/80 hover:bg-white border-slate-200/90 opacity-80 hover:opacity-100`
                  }`}
                >
                  {/* Card Header: Current tag + Level */}
                  <div className="w-full flex items-center justify-between min-h-[22px]">
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[8.5px] font-black flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>فعلی</span>
                      </span>
                    ) : <span />}
                    <span className="text-[10.5px] font-mono font-black" style={{ color: stage.color }}>
                      Lv.{stage.minLevel.toLocaleString('fa-IR')}
                    </span>
                  </div>

                  {/* Pure 3D Procedural Crest (Strictly ordered without bitmap images) */}
                  <div className="pt-0.5 flex items-center justify-center transition-transform group-hover:scale-110 h-14 w-full">
                    <GamingLevelBadge level={stage.minLevel} size="lg" showLevelNumber={false} showStars={false} showTierName={false} interactive={false} />
                  </div>

                  {/* Stage Info */}
                  <div className="space-y-0.5 w-full">
                    <div className="text-[11.5px] font-black text-slate-900 truncate px-1">
                      {stage.nameFa}
                    </div>
                    <div className="text-[10px] font-mono font-bold" style={{ color: stage.color }}>
                      لول {stage.minLevel.toLocaleString('fa-IR')} تا {stage.maxLevel.toLocaleString('fa-IR')}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="w-full pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono font-bold">#{stage.id}</span>
                    {isUnlocked ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>باز شده</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>قفل</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>با ثبت رکورد در مسابقات زنده، امتیاز کسب کرده و تمام ۵۰۰ نشان رسمی را فتح کنید.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition cursor-pointer text-xs shadow-sm"
          >
            بستن ویترین
          </button>
        </div>
      </div>
    </div>
  );
}

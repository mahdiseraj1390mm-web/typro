'use client';

import React, { useState } from 'react';
import { X, Send, Coins, Smile, Sparkles, AlertCircle, Heart } from 'lucide-react';
import AnimatedVehicleSkin from './AnimatedVehicleSkin';

interface VehicleActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDriver: {
    odUserId: string;
    name: string;
    skinId: string;
    level?: number;
  } | null;
  currentUserCoins: number;
  onSendTip: (targetUserId: string, targetName: string, amount: number) => void;
  onSendReaction: (targetUserId: string, emoji: string) => void;
}

const EMOJI_REACTIONS = [
  { emoji: '🔥', label: 'آتشین' },
  { emoji: '🚀', label: 'موشک' },
  { emoji: '👏', label: 'تشویق' },
  { emoji: '⚡', label: 'صاعقه' },
  { emoji: '😎', label: 'حرفه‌ای' },
  { emoji: '🏎️', label: 'گاز بده' },
  { emoji: '❤️', label: 'عالی' },
  { emoji: '👑', label: 'سلطان' },
  { emoji: '💨', label: 'گرد و خاک' },
  { emoji: '🤯', label: 'شگفت‌انگیز' },
];

const PRESET_TIPS = [10, 25, 50, 100, 250];

export default function VehicleActionModal({
  isOpen,
  onClose,
  targetDriver,
  currentUserCoins,
  onSendTip,
  onSendReaction,
}: VehicleActionModalProps) {
  const [activeTab, setActiveTab] = useState<'reaction' | 'tip'>('reaction');
  const [customTip, setCustomTip] = useState<string>('50');
  const [tipError, setTipError] = useState<string | null>(null);

  if (!isOpen || !targetDriver) return null;

  const handleTipSubmit = (amount: number) => {
    if (amount <= 0) {
      setTipError('لطفاً مقداری معتبر وارد کنید.');
      return;
    }
    if (amount > currentUserCoins) {
      setTipError(`موجودی سکه شما کافی نیست! (موجودی فعلی: ${currentUserCoins.toLocaleString('fa-IR')} سکه)`);
      return;
    }

    setTipError(null);
    onSendTip(targetDriver.odUserId, targetDriver.name, amount);
    onClose();
  };

  const handleReactionSelect = (emoji: string) => {
    onSendReaction(targetDriver.odUserId, emoji);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-16 h-12 flex items-center justify-center bg-slate-800/80 rounded-2xl border border-slate-700/80 p-1">
              <AnimatedVehicleSkin skinId={targetDriver.skinId} isMoving={false} size="sm" />
            </div>
            <div>
              <div className="text-[11px] text-blue-300 font-bold">تعامل با خودروی</div>
              <h3 className="text-base font-black text-white">{targetDriver.name}</h3>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('reaction')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'reaction'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>ارسال ایموجی حباب‌دار</span>
          </button>

          <button
            onClick={() => setActiveTab('tip')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'tip'
                ? 'border-amber-500 text-amber-600 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>انعام سکه</span>
          </button>
        </div>

        {/* Tab 1: Floating Emoji Reaction */}
        {activeTab === 'reaction' && (
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-600 leading-relaxed">
              یک ایموجی انتخاب کنید تا به صورت <strong>حباب متحرک و درخشان</strong> بالای خودروی این بازیکن روی پیست پرواز کند:
            </div>

            <div className="grid grid-cols-5 gap-2">
              {EMOJI_REACTIONS.map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleReactionSelect(item.emoji)}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 hover:bg-amber-100 border border-slate-200 hover:border-amber-300 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                  title={item.label}
                >
                  <span className="text-2xl leading-none">{item.emoji}</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Tip Coins */}
        {activeTab === 'tip' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>انعام سکه برای مهارت و سرعت راننده:</span>
              <span className="text-amber-600 font-mono">
                موجودی شما: {currentUserCoins.toLocaleString('fa-IR')} 🪙
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_TIPS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleTipSubmit(amount)}
                  disabled={amount > currentUserCoins}
                  className={`py-2 px-1 rounded-xl text-xs font-black border transition cursor-pointer flex flex-col items-center gap-0.5 ${
                    amount > currentUserCoins
                      ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  }`}
                >
                  <span>+{amount}</span>
                  <span className="text-[9px]">سکه</span>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">یا مقدار دلخواه:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max={currentUserCoins}
                  value={customTip}
                  onChange={(e) => {
                    setCustomTip(e.target.value);
                    setTipError(null);
                  }}
                  className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-amber-500"
                  placeholder="تعداد سکه"
                />
                <button
                  onClick={() => handleTipSubmit(Number(customTip))}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال</span>
                </button>
              </div>
            </div>

            {tipError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold flex items-center gap-1.5 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{tipError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

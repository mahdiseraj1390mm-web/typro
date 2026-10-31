'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  Plus,
  Sparkles,
  Award,
  Video,
  Shield,
  Send,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  author: string;
  authorLevel: number;
  time: string;
  title: string;
  content: string;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: Comment[];
  tag: string;
  badge: string;
}

export default function ExperiencesPage() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      author: 'رضا محمدی',
      authorLevel: 42,
      time: '۲ ساعت پیش',
      title: 'چگونه پس از ۳ ماه تمرین مداوم از ۳۰ WPM به ۸۵ WPM رسیدم؟',
      content:
        'مهم‌ترین عامل در پیشرفت من، پرهیز مطلق از نگاه کردن به کیبورد بود. حتی اگر اشتباه می‌کردم با نگاه کردن اصلاح نمی‌کردم و اجازه دادم حافظه عضلانی انگشتانم شکل بگیرد. استفاده از دریل‌های ردیف میانی تایپرو معجزه کرد!',
      likes: 128,
      isLiked: false,
      isBookmarked: false,
      comments: [
        { id: 'c-1', author: 'علی کریمی', text: 'بسیار کاربردی و عالی بود. منم از دریل کلیدهای ضعیف شروع کردم.', time: '۱ ساعت پیش' },
      ],
      tag: 'تجربه آموزشی',
      badge: 'تایپیست نخبه',
    },
    {
      id: 'post-2',
      author: 'سارا کاویانی',
      authorLevel: 31,
      time: 'دیروز',
      title: 'رکورد جدید در مسابقه زنده لابی ۳: ۶۸ کلمه در دقیقه بدون خطا',
      content:
        'امروز تونستم در پیست سایبر سیتی با تمرکز کامل به دقت ۱۰۰ درصدی برسم و جام طلایی هفته رو از آن خود کنم. ریتم ضربه‌زنی آرام و پیوسته خیلی موثرتر از شتاب‌زدگی است.',
      likes: 85,
      isLiked: true,
      isBookmarked: true,
      comments: [
        { id: 'c-2', author: 'محسن صابری', text: 'تبریک میگم سارا خانم! ریتم بدون اشتباه کلید برد در تایپرو هست.', time: '۲۰ ساعت پیش' },
      ],
      tag: 'ویدیو و رکورد',
      badge: 'قهرمان لیگ',
    },
  ]);

  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('تجربه آموزشی');
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked }
          : p
      )
    );
  };

  const handleBookmark = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isBookmarked;
          showToast(nextState ? 'تجربه به نشان‌شده‌ها افزوده شد.' : 'از نشان‌شده‌ها حذف شد.');
          return { ...p, isBookmarked: nextState };
        }
        return p;
      })
    );
  };

  const handleShare = (post: Post) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://typro.ir/experiences#${post.id}`);
    }
    showToast('🔗 لینک اختصاصی این تجربه در کلیپ‌بورد ذخیره شد.');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newEntry: Post = {
      id: `post-${Date.now()}`,
      author: 'علیرضا رضایی (شما)',
      authorLevel: 28,
      time: 'هم‌اکنون',
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 0,
      isLiked: false,
      isBookmarked: false,
      comments: [],
      tag: newTag,
      badge: 'تایپیست فعال',
    };

    setPosts([newEntry, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewPostOpen(false);
    showToast('🎉 تجربه شما با موفقیت ثبت و در تالار تجربیات کاربران منتشر شد.');
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: 'علیرضا رضایی (شما)',
      text: commentInput.trim(),
      time: 'هم‌اکنون',
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
    setCommentInput('');
    showToast('دیدگاه شما با موفقیت ثبت شد.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Post CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            بخش ۱۱۸ و ۱۴۸ پروپوزال: جامعه تایپیست‌های ایران
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            تجربیات و ویدیوهای مهارتی کاربران
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            داستان‌های پیشرفت، تکنیک‌های افزایش سرعت، بررسی کیبوردهای مکانیکی و پرسش و پاسخ.
          </p>
        </div>

        <button
          onClick={() => setNewPostOpen(!newPostOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت تجربه جدید</span>
        </button>
      </div>

      {/* New Post Form Drawer */}
      {newPostOpen && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              به اشتراک‌گذاری تجربه تایپ یا رکورد جدید
            </h3>
            <button
              type="button"
              onClick={() => setNewPostOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="عنوان تجربه (مثلاً: چطور بر استرس مسابقات زنده غلبه کنیم؟)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
            <div>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              >
                <option value="تجربه آموزشی">تجربه آموزشی</option>
                <option value="ویدیو و رکورد">ویدیو و رکورد</option>
                <option value="بررسی کیبورد">بررسی کیبورد</option>
                <option value="ارگونومی و سلامت">ارگونومی و سلامت</option>
              </select>
            </div>
          </div>

          <textarea
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            placeholder="متن کامل تجربه، نکات عملی یا توضیح ویدیوی رکورد خود را بنویسید..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewPostOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
            >
              انتشار عمومی تجربه
            </button>
          </div>
        </form>
      )}

      {/* Experiences Feed */}
      <div className="space-y-6">
        {posts.map((post) => {
          const isCommentsOpen = openCommentsPostId === post.id;

          return (
            <article
              key={post.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 hover:border-blue-200 transition"
            >
              {/* Author bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center shadow-xs">
                    {post.author[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {post.author}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-bold">
                        سطح {post.authorLevel}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold">
                        {post.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{post.time}</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  {post.tag}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h2 className="font-black text-base text-slate-900 leading-snug">{post.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{post.content}</p>
              </div>

              {/* Social Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition font-bold ${
                      post.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500' : ''}`} />
                    <span className="font-mono">{post.likes}</span>
                  </button>

                  <button
                    onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post.id)}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition font-bold"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-mono">{post.comments.length} نظر</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`p-2 rounded-xl transition ${
                      post.isBookmarked
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title="نشان کردن"
                  >
                    <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-blue-600' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    title="اشتراک‌گذاری"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Comments Section */}
              {isCommentsOpen && (
                <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in">
                  <div className="space-y-2">
                    {post.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center text-slate-500">
                          <strong className="text-slate-800">{c.author}</strong>
                          <span className="text-[10px] font-mono">{c.time}</span>
                        </div>
                        <p className="text-slate-600">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="نظر یا پرسش خود را بنویسید..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

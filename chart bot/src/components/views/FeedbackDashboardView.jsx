import React, { useMemo, useState } from 'react';
import { BarChart3, MessageSquareText, RefreshCw, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function FeedbackDashboardView() {
  const { feedback, refreshMyFeedback, showToast } = useChat();
  const [refreshing, setRefreshing] = useState(false);
  const stats = useMemo(() => {
    const rated = feedback.filter((item) => Number.isInteger(item.starRating) && item.starRating >= 1 && item.starRating <= 5);
    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: rated.filter((item) => item.starRating === rating).length,
    }));
    const categoryCounts = feedback
      .flatMap((item) => item.categories || [])
      .reduce((counts, category) => {
        counts[category] = (counts[category] || 0) + 1;
        return counts;
      }, {});

    return {
      total: feedback.length,
      average: rated.length
        ? (rated.reduce((sum, item) => sum + item.starRating, 0) / rated.length).toFixed(1)
        : '—',
      positive: feedback.filter((item) => item.thumbsRating === true).length,
      negative: feedback.filter((item) => item.thumbsRating === false).length,
      distribution,
      categories: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      maxCount: Math.max(1, ...distribution.map((item) => item.count)),
    };
  }, [feedback]);

  const cards = [
    { label: 'My submissions', value: stats.total, icon: MessageSquareText, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Average star rating', value: stats.average, icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Helpful responses', value: stats.positive, icon: ThumbsUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Needs improvement', value: stats.negative, icon: ThumbsDown, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMyFeedback();
    } catch (error) {
      showToast(`Feedback could not be refreshed: ${error.message}`, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="h-full overflow-y-auto bg-[#F8FAFC] px-4 py-6 text-[#111827] dark:bg-[#0B1020] dark:text-[#F3F4F6] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6366F1] dark:text-[#A5B4FC]">
              <BarChart3 className="h-4 w-4" /> Feedback insights
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My feedback</h1>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#9CA3AF]">
              Your submissions are stored securely by the feedback service.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#F1F5F9] disabled:opacity-50 dark:border-[#293247] dark:bg-[#111827] dark:text-[#D1D5DB] dark:hover:bg-[#1E293B] sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/25 dark:text-indigo-200">
          This view contains only feedback associated with your account or anonymous session. Admin notes are private.
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <article key={label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-[#293247] dark:bg-[#111827]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#64748B] dark:text-[#9CA3AF]">{label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-[#293247] dark:bg-[#111827] sm:p-6">
            <h2 className="text-base font-bold">Your rating distribution</h2>
            <div className="mt-5 space-y-3">
              {stats.distribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <span className="w-12 shrink-0 text-[#64748B] dark:text-[#9CA3AF]">{rating} star{rating > 1 ? 's' : ''}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F1F5F9] dark:bg-[#1E293B]">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500" style={{ width: `${(count / stats.maxCount) * 100}%` }} />
                  </div>
                  <span className="w-7 text-right font-semibold tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-[#293247] dark:bg-[#111827] sm:p-6">
            <h2 className="text-base font-bold">Categories you selected</h2>
            <div className="mt-5 space-y-3">
              {stats.categories.length ? stats.categories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] px-3.5 py-3 dark:bg-[#0B1020]">
                  <span className="truncate text-sm">{category}</span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">{count}</span>
                </div>
              )) : <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">No categories selected yet.</p>}
            </div>
          </article>
        </div>

        <article className="mt-5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm dark:border-[#293247] dark:bg-[#111827]">
          <div className="border-b border-[#E2E8F0] px-5 py-4 dark:border-[#293247]">
            <h2 className="font-bold">Recent submissions</h2>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">Feedback status is managed by the ChatBot AI support team.</p>
          </div>
          {feedback.length ? (
            <ul className="divide-y divide-[#E2E8F0] dark:divide-[#293247]">
              {[...feedback].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map((item) => (
                <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      <span>{item.type === 'overall' ? 'Overall app rating' : 'AI response feedback'}</span>
                      {item.starRating && <span className="inline-flex items-center gap-1 text-amber-500"><Star className="h-3.5 w-3.5 fill-current" />{item.starRating}/5</span>}
                      {item.thumbsRating === true && <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />}
                      {item.thumbsRating === false && <ThumbsDown className="h-3.5 w-3.5 text-rose-500" />}
                    </div>
                    {item.comment && <p className="mt-1 break-words text-sm text-[#64748B] dark:text-[#9CA3AF]">{item.comment}</p>}
                    {!!item.categories?.length && <p className="mt-1 text-xs text-[#64748B] dark:text-[#9CA3AF]">{item.categories.join(' · ')}</p>}
                    <p className="mt-1.5 text-[11px] text-[#94A3B8]">{new Date(item.submittedAt).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : item.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'}`}>
                    {item.status || 'New'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <MessageSquareText className="mx-auto h-8 w-8 text-[#94A3B8]" />
              <p className="mt-3 text-sm font-semibold">No feedback yet</p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#9CA3AF]">Ratings you submit in chats will show up here.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

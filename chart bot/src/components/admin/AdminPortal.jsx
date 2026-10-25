import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  LogOut,
  MessageSquareText,
  Search,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  Users,
  X,
} from 'lucide-react';

const categories = [
  'Incorrect answer',
  'Incomplete information',
  'Difficult to understand',
  'Irrelevant response',
  'Slow response',
  'Other',
];

async function adminRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Admin API returned ${response.status}.`);
  return data;
}

function MetricCard({ title, value, icon: Icon, accent }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
    </article>
  );
}

function RatingDistribution({ values = [] }) {
  const max = Math.max(1, ...values.map((item) => item.count));
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((rating) => {
        const count = values.find((item) => item.rating === rating)?.count || 0;
        return (
          <div key={rating} className="flex items-center gap-3 text-sm">
            <span className="w-12 shrink-0 text-slate-500 dark:text-slate-400">{rating} star{rating > 1 ? 's' : ''}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-300 transition-all duration-500" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="w-8 text-right font-semibold tabular-nums">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function FeedbackDetails({ record, onClose, onSaved, onDelete }) {
  const [status, setStatus] = useState(record.status);
  const [adminNote, setAdminNote] = useState(record.adminNote || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(record.status);
    setAdminNote(record.adminNote || '');
    setError('');
  }, [record]);

  const saveChanges = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await adminRequest(`/api/admin/feedback/${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote }),
      });
      await onSaved(data.feedback);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-feedback-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Feedback details</p>
            <h2 id="admin-feedback-title" className="mt-1 truncate text-lg font-bold">{record.id}</h2>
          </div>
          <button onClick={onClose} aria-label="Close details" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['User identifier', record.userIdentifier || record.anonymousId || 'Anonymous'],
              ['Submitted', new Date(record.submittedAt).toLocaleString()],
              ['Conversation', record.conversationId || 'Overall app rating'],
              ['AI response', record.responseId || 'Not applicable'],
              ['Rating', record.starRating ? `${record.starRating} / 5` : 'No star rating'],
              ['Thumbs', record.thumbsRating === null ? 'Not rated' : record.thumbsRating ? 'Helpful' : 'Unhelpful'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/70">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 break-all text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold">Feedback categories</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {record.categories?.length ? record.categories.map((category) => <span key={category} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200">{category}</span>) : <span className="text-sm text-slate-500">No categories selected</span>}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold">User comment</h3>
            <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-200 p-3.5 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:text-slate-300">{record.comment || 'No written comment provided.'}</p>
          </div>

          {record.responseContent && (
            <details className="mt-4 rounded-xl border border-slate-200 p-3.5 dark:border-slate-700">
              <summary className="cursor-pointer text-sm font-semibold">View associated AI response</summary>
              <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{record.responseContent}</p>
            </details>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
                <option>New</option><option>Reviewed</option><option>Resolved</option>
              </select>
            </label>
            <div className="rounded-xl bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Internal notes are visible only to authenticated administrators.
            </div>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold">Internal admin note</span>
            <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} maxLength={5000} rows={3} placeholder="Add a private note for the team..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950" />
          </label>
          {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button onClick={() => onDelete(record)} className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">Delete feedback</button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={saveChanges} disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export function AdminPortal() {
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({ rating: '', category: '', status: '', from: '', to: '', search: '', sort: 'newest' });
  const [searchDraft, setSearchDraft] = useState('');
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    const data = await adminRequest('/api/admin/dashboard');
    setDashboard(data);
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
        sort: filters.sort,
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'sort' && key !== 'search') query.set(key, value);
      });
      if (filters.search) query.set('search', filters.search);
      const data = await adminRequest(`/api/admin/feedback?${query}`);
      setRecords(data.feedback);
      setPagination(data.pagination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  const refreshOverview = useCallback(async () => {
    try {
      await fetchDashboard();
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    let active = true;
    adminRequest('/api/admin/auth/me')
      .then((data) => {
        if (active) setAdmin(data.admin);
      })
      .catch(() => {
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!admin) return;
    fetchDashboard();
  }, [admin, fetchDashboard]);

  useEffect(() => {
    if (!admin || activeSection !== 'feedback') return;
    fetchRecords();
  }, [admin, activeSection, fetchRecords]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const data = await adminRequest('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAdmin(data.admin);
      setPassword('');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    try {
      await adminRequest('/api/admin/auth/logout', { method: 'POST', body: '{}' });
      setAdmin(null);
      setDashboard(null);
      setRecords([]);
    } catch (logoutError) {
      setError(logoutError.message);
    } finally {
      setLogoutLoading(false);
    }
  };

  const openRecord = async (record) => {
    setError('');
    try {
      const data = await adminRequest(`/api/admin/feedback/${encodeURIComponent(record.id)}`);
      setSelectedRecord(data.feedback);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const persistRecord = async (updated) => {
    setSelectedRecord(null);
    await Promise.all([fetchDashboard(), fetchRecords()]);
    if (updated) setError('');
  };

  const deleteRecord = async (record) => {
    if (!window.confirm(`Permanently delete feedback ${record.id}?`)) return;
    try {
      await adminRequest(`/api/admin/feedback/${encodeURIComponent(record.id)}`, { method: 'DELETE' });
      setSelectedRecord(null);
      await Promise.all([fetchDashboard(), fetchRecords()]);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const metricCards = useMemo(() => {
    const values = dashboard?.overview;
    return [
      { title: 'Total submissions', value: values?.total ?? '—', icon: MessageSquareText, accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300' },
      { title: 'Average star rating', value: values?.averageRating ?? '—', icon: Star, accent: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300' },
      { title: 'Positive feedback', value: values?.positive ?? '—', icon: ThumbsUp, accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300' },
      { title: 'Negative feedback', value: values?.negative ?? '—', icon: ThumbsDown, accent: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300' },
      { title: 'New feedback', value: values?.newCount ?? '—', icon: CircleAlert, accent: 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300' },
      { title: 'Resolved feedback', value: values?.resolvedCount ?? '—', icon: Check, accent: 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-300' },
    ];
  }, [dashboard]);

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">Checking administrator session…</div>;
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-9">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><ShieldCheck className="h-6 w-6" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">ChatBot AI · Admin</p>
          <h1 className="mt-2 text-2xl font-bold">Administrator sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Sign in with an administrator account provisioned on the backend.</p>
          <form onSubmit={submitLogin} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Admin email</span>
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Password</span>
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
            <button type="submit" disabled={loginLoading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-50">{loginLoading ? 'Signing in…' : 'Sign in securely'}</button>
          </form>
          <a href="/" className="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-indigo-500">Return to chatbot</a>
        </section>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white"><Activity className="h-4 w-4" /></span>
          <div><p className="text-sm font-bold">ChatBot AI</p><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Admin workspace</p></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setDark((value) => !value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">{dark ? 'Light mode' : 'Dark mode'}</button>
          <div className="hidden max-w-48 truncate text-right sm:block"><p className="text-xs font-semibold">{admin.email}</p><p className="text-[10px] text-slate-500">Administrator</p></div>
          <button onClick={logout} disabled={logoutLoading} aria-label="Log out" title="Log out" className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:w-60 md:flex-col md:border-b-0 md:border-r md:p-4">
          <p className="hidden px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 md:block">Workspace</p>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'feedback', label: 'Feedback management', icon: MessageSquareText },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveSection(id); setError(''); }} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeSection === id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
          <div className="mt-auto hidden rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/70 dark:text-slate-400 md:block">
            <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
            Admin APIs are protected by a server-validated session.
          </div>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {error && <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError('')}><X className="h-4 w-4" /></button></div>}
            {activeSection === 'overview' ? (
              <>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div><p className="mb-1 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300"><Activity className="h-4 w-4" /> Feedback analytics</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard overview</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live statistics calculated from feedback database records.</p></div>
                  <button onClick={refreshOverview} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">Refresh data</button>
                </div>
                {dashboard ? (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {metricCards.map((card) => <MetricCard key={card.title} {...card} />)}
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                        <div className="mb-5"><h2 className="font-bold">Rating distribution</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">All star-rated feedback in the database</p></div>
                        <RatingDistribution values={dashboard.ratingDistribution} />
                      </article>
                      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                        <div className="mb-5"><h2 className="font-bold">Feedback trend</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Submissions by day · last 30 days</p></div>
                        {dashboard.feedbackTrend.length ? (
                          <div className="flex h-44 items-end gap-1.5 overflow-x-auto border-b border-slate-200 pb-1 dark:border-slate-700">
                            {dashboard.feedbackTrend.map((item) => {
                              const max = Math.max(1, ...dashboard.feedbackTrend.map((row) => row.count));
                              return <div key={item.date} title={`${item.date}: ${item.count}`} className="group flex h-full min-w-3 flex-1 items-end justify-center"><div className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-400 transition-opacity group-hover:opacity-75" style={{ height: `${Math.max(5, (item.count / max) * 100)}%` }} /></div>;
                            })}
                          </div>
                        ) : <div className="flex h-44 flex-col items-center justify-center rounded-xl bg-slate-50 text-center dark:bg-slate-800/60"><Clock3 className="h-6 w-6 text-slate-400" /><p className="mt-2 text-sm font-semibold">No submissions yet</p><p className="mt-1 text-xs text-slate-500">Feedback trends will appear here.</p></div>}
                        <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>30 days ago</span><span>Today</span></div>
                      </article>
                    </div>
                    <button onClick={() => setActiveSection('feedback')} className="mt-5 flex w-full items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-4 text-left transition hover:bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40"><span><span className="block text-sm font-bold">Review submissions</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Search, filter, and manage individual feedback records.</span></span><ChevronRight className="h-5 w-5 text-indigo-500" /></button>
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
                )}
              </>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div><p className="mb-1 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300"><Users className="h-4 w-4" /> User submissions</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Feedback management</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pagination.total} records in the feedback database</p></div>
                  <button onClick={() => { fetchRecords(); refreshOverview(); }} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">Refresh</button>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); setFilters((current) => ({ ...current, search: searchDraft })); setPagination((current) => ({ ...current, page: 1 })); }} className="mb-4 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                  <div className="relative sm:col-span-2 xl:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search feedback ID or user..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950" /></div>
                  <select aria-label="Filter by rating" value={filters.rating} onChange={(event) => { setFilters((current) => ({ ...current, rating: event.target.value })); setPagination((current) => ({ ...current, page: 1 })); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All ratings</option>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} star{rating > 1 ? 's' : ''}</option>)}</select>
                  <select aria-label="Filter by category" value={filters.category} onChange={(event) => { setFilters((current) => ({ ...current, category: event.target.value })); setPagination((current) => ({ ...current, page: 1 })); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
                  <select aria-label="Filter by status" value={filters.status} onChange={(event) => { setFilters((current) => ({ ...current, status: event.target.value })); setPagination((current) => ({ ...current, page: 1 })); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All statuses</option><option>New</option><option>Reviewed</option><option>Resolved</option></select>
                  <select aria-label="Sort feedback" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="rating">Highest rating</option></select>
                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-7"><label className="text-xs text-slate-500">From <input type="date" value={filters.from} onChange={(event) => { setFilters((current) => ({ ...current, from: event.target.value })); setPagination((current) => ({ ...current, page: 1 })); }} className="ml-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs text-slate-500">To <input type="date" value={filters.to} onChange={(event) => { setFilters((current) => ({ ...current, to: event.target.value })); setPagination((current) => ({ ...current, page: 1 })); }} className="ml-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950" /></label><button type="submit" className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500">Apply search</button><button type="button" onClick={() => { setSearchDraft(''); setFilters({ rating: '', category: '', status: '', from: '', to: '', search: '', sort: 'newest' }); setPagination((current) => ({ ...current, page: 1 })); }} className="rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Reset</button></div>
                </form>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {loading ? (
                    <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>
                  ) : records.length ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400"><tr><th className="px-4 py-3">Feedback ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Conversation / response</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Comment</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{records.map((record) => <tr key={record.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"><td className="max-w-40 truncate px-4 py-3 font-mono text-[11px]" title={record.id}>{record.id}</td><td className="max-w-36 truncate px-4 py-3 text-xs" title={record.userIdentifier}>{record.userIdentifier || 'Anonymous'}</td><td className="max-w-40 truncate px-4 py-3 text-xs text-slate-500">{record.conversationId ? `${record.conversationId} / ${record.responseId}` : 'Overall app rating'}</td><td className="px-4 py-3">{record.starRating ? <span className="inline-flex items-center gap-1 font-semibold text-amber-500"><Star className="h-3.5 w-3.5 fill-current" />{record.starRating}</span> : record.thumbsRating ? <ThumbsUp className="h-4 w-4 text-emerald-500" /> : <ThumbsDown className="h-4 w-4 text-rose-500" />}</td><td className="max-w-40 truncate px-4 py-3 text-xs">{record.categories?.join(', ') || '—'}</td><td className="max-w-44 truncate px-4 py-3 text-xs text-slate-500" title={record.comment}>{record.comment || '—'}</td><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{new Date(record.submittedAt).toLocaleString()}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${record.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : record.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>{record.status}</span></td><td className="px-4 py-3"><button onClick={() => openRecord(record)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40">View</button></td></tr>)}</tbody>
                        </table>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs dark:border-slate-800"><span className="text-slate-500">Page {pagination.page} of {Math.max(1, pagination.totalPages)} · {pagination.total} results</span><div className="flex items-center gap-2"><button onClick={() => setPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))} disabled={pagination.page <= 1} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="h-3.5 w-3.5" />Previous</button><button onClick={() => setPagination((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }))} disabled={pagination.page >= pagination.totalPages} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-40 dark:border-slate-700">Next<ChevronRight className="h-3.5 w-3.5" /></button></div></div>
                    </>
                  ) : (
                    <div className="px-5 py-16 text-center"><MessageSquareText className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-sm font-semibold">No matching feedback</p><p className="mt-1 text-xs text-slate-500">{pagination.total ? 'Try adjusting your search or filters.' : 'User submissions will appear here automatically.'}</p></div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      {selectedRecord && <FeedbackDetails record={selectedRecord} onClose={() => setSelectedRecord(null)} onSaved={persistRecord} onDelete={deleteRecord} />}
    </div>
  );
}

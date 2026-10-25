import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
  Check,
  X,
  Bell,
} from 'lucide-react';

export function ScheduledView() {
  const {
    scheduledItems,
    addScheduledItem,
    updateScheduledItem,
    toggleScheduledComplete,
    deleteScheduledItem,
    openModal,
    showToast,
  } = useChat();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'completed' | 'all'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    time: '12:00',
    category: 'Reminder',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      time: '12:00',
      category: 'Reminder',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter a task title.', 'error');
      return;
    }
    if (!formData.date || !formData.time) {
      showToast('Please select a valid date and time.', 'error');
      return;
    }

    if (editingId) {
      updateScheduledItem(editingId, formData);
    } else {
      addScheduledItem(formData);
    }
    resetForm();
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      date: item.date,
      time: item.time,
      category: item.category || 'Reminder',
    });
    setIsCreating(true);
  };

  const filteredTasks = scheduledItems.filter((t) => {
    if (filter === 'upcoming') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getTimeStatus = (dateStr, timeStr, completed) => {
    if (completed) return { text: 'Completed', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20' };
    const taskDate = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diffHours = (taskDate - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { text: 'Overdue', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-500/20' };
    } else if (diffHours < 24) {
      return { text: `Due Today at ${timeStr}`, color: 'text-[#818CF8] bg-indigo-50 dark:bg-indigo-950/40 border-[#818CF8]/30' };
    } else {
      return { text: `${dateStr} • ${timeStr}`, color: 'text-[#64748B] dark:text-[#9CA3AF] bg-slate-100 dark:bg-[#1E293B] border-slate-200 dark:border-[#293247]' };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1020] p-4 sm:p-6 md:p-8 animate-fade-in font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#151C2C] border border-indigo-200/60 dark:border-[#293247] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                <Clock className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                Scheduled Tasks & Reminders
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Create and manage future reminders and AI study sessions with active in-app notifications.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Reminder</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['upcoming', 'completed', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-[#818CF8] text-white shadow-sm'
                  : 'bg-white dark:bg-[#151C2C] text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] border border-[#E2E8F0] dark:border-[#293247]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Modal / Inline Creator Form */}
        {isCreating && (
          <form
            onSubmit={handleSave}
            className="rounded-2xl bg-white dark:bg-[#151C2C] border border-[#818CF8] p-5 shadow-xl animate-slide-up space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#293247]">
              <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6]">
                {editingId ? 'Edit Scheduled Task' : 'New Scheduled Task'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Review machine learning model accuracy"
                required
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes or instructions for the reminder"
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                >
                  <option value="Reminder">Reminder</option>
                  <option value="AI Task">AI Task</option>
                  <option value="Learning">Learning</option>
                  <option value="Review">Review</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Schedule Reminder'}
              </button>
            </div>
          </form>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] rounded-2xl shadow-sm space-y-3">
            <Bell className="w-12 h-12 mx-auto text-[#64748B]/40 dark:text-[#9CA3AF]/40" />
            <h3 className="text-base font-semibold text-[#111827] dark:text-[#F3F4F6]">
              {filter === 'completed' ? 'No completed tasks yet' : 'No upcoming scheduled tasks'}
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] max-w-md mx-auto">
              Schedule future prompts, reminders, and study sessions to keep your productivity high.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const status = getTimeStatus(task.date, task.time, task.completed);

              return (
                <div
                  key={task.id}
                  className={`group flex items-start justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#151C2C] border transition-all duration-200 shadow-sm ${
                    task.completed
                      ? 'border-[#E2E8F0]/70 dark:border-[#293247]/50 opacity-70'
                      : 'border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Complete toggle checkbox */}
                    <button
                      onClick={() => toggleScheduledComplete(task.id)}
                      className="mt-0.5 text-[#64748B] hover:text-[#818CF8] transition-colors focus:outline-none"
                      title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#64748B] hover:text-[#818CF8]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4
                        className={`font-semibold text-sm sm:text-base leading-snug ${
                          task.completed
                            ? 'line-through text-[#64748B] dark:text-[#9CA3AF]'
                            : 'text-[#111827] dark:text-[#F3F4F6]'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.color}`}
                        >
                          {status.text}
                        </span>

                        <span className="text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF]">
                          {task.category || 'Reminder'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Small Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openModal('deleteScheduledConfirm', task)}
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

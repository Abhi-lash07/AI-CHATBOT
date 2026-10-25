import React, { useState, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  Library,
  Search,
  Bookmark,
  Trash2,
  Edit2,
  Copy,
  Check,
  Calendar,
  Tag,
  ArrowRight,
  MessageSquare,
  X,
} from 'lucide-react';

export function LibraryView() {
  const {
    libraryItems,
    renameLibraryItem,
    openModal,
    selectChat,
    showToast,
  } = useChat();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['All', 'Code', 'Explanations', 'AI Responses', 'Ideas'];

  const filteredItems = useMemo(() => {
    return libraryItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [libraryItems, search, selectedCategory]);

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    showToast('Copied content to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartRename = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleSaveRename = (id) => {
    if (editTitle.trim()) {
      renameLibraryItem(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1020] p-4 sm:p-6 md:p-8 animate-fade-in font-sans">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#151C2C] border border-indigo-200/60 dark:border-[#293247] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                <Library className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                Saved Library
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Organize and search your bookmark collection of code solutions, explanations, and notes.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-[#64748B] dark:text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved items..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] placeholder:text-[#64748B] dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#818CF8] shadow-sm transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#818CF8] text-white shadow-sm'
                  : 'bg-white dark:bg-[#151C2C] text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] border border-[#E2E8F0] dark:border-[#293247]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Saved Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] rounded-2xl shadow-sm space-y-3">
            <Bookmark className="w-12 h-12 mx-auto text-[#64748B]/40 dark:text-[#9CA3AF]/40" />
            <h3 className="text-base font-semibold text-[#111827] dark:text-[#F3F4F6]">
              {search ? 'No matching saved items found' : 'Your Library is empty'}
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] max-w-md mx-auto">
              Save any response in chat by clicking the Bookmark icon on the message toolbar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8] dark:hover:border-[#818CF8] p-5 shadow-sm hover:shadow-[0_8px_25px_-5px_rgba(129,140,248,0.18)] transition-all duration-200"
              >
                {/* Header bar: Title & Meta */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#293247]/60">
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(item.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="w-full bg-[#F8FAFC] dark:bg-[#0B1020] px-2.5 py-1 rounded-lg border border-[#818CF8] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveRename(item.id)}
                          className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-base text-[#111827] dark:text-[#F3F4F6] leading-snug">
                        {item.title}
                      </h3>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] border border-indigo-200/50 dark:border-[#293247]">
                        {item.category || 'Note'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Copy, Rename, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.content)}
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                      title="Copy content"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleStartRename(item)}
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                      title="Rename item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Compact Delete Button */}
                    <button
                      onClick={() => openModal('deleteLibraryConfirm', item)}
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete from library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Body with Markdown Rendering */}
                <div className="pt-3 text-sm text-[#111827] dark:text-[#F3F4F6] leading-[1.7]">
                  <MarkdownRenderer content={item.content} />
                </div>

                {/* Source Link */}
                {item.sourceChatId && (
                  <div className="mt-4 pt-2 border-t border-[#E2E8F0]/60 dark:border-[#293247]/50 flex justify-end">
                    <button
                      onClick={() => selectChat(item.sourceChatId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#818CF8] hover:text-[#6366F1] transition-colors"
                    >
                      <span>Jump to original conversation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

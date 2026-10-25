import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  SquarePen,
  Images,
  Library,
  Clock,
  Puzzle,
  Folder,
  Code2,
  Ellipsis,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  X,
  HelpCircle,
  Sliders,
  Trash,
  Menu,
  Sparkles,
  Info,
  Keyboard,
  MessageCircle,
  LogIn,
  LogOut,
  User,
  BarChart3,
  Star,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar() {
  const {
    activeView,
    setActiveView,
    conversations,
    currentChatId,
    selectChat,
    createNewChat,
    renameChat,
    openModal,
    searchQuery,
    setSearchQuery,
    isSidebarOpen,
    setIsSidebarOpen,
    projects,
    user,
    setAuthModalOpen,
    setAuthMode,
    logoutUser,
  } = useChat();

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content && m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameChat(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    openModal('deleteConfirm', chat);
  };

  const handleClearAllClick = () => {
    openModal('clearConfirm');
  };

  // Main Navigation Items:
  // 1. New Chat (SquarePen)
  // 2. Images (Images)
  // 3. Library (Library)
  // 4. Scheduled (Clock)
  // 5. Plugins (Puzzle)
  // 6. Projects (Folder)
  // 7. Codex (Code2)
  // 8. More (Ellipsis)
  const navItems = [
    {
      id: 'new_chat',
      label: 'New Chat',
      icon: SquarePen,
      action: () => {
        createNewChat();
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      },
      isActive: activeView === 'chat' && !currentChatId,
      highlight: true,
    },
    {
      id: 'images',
      label: 'Images',
      icon: Images,
      action: () => {
        setActiveView('images');
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      },
      isActive: activeView === 'images',
    },
    {
      id: 'library',
      label: 'Library',
      icon: Library,
      action: () => {
        setActiveView('library');
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      },
      isActive: activeView === 'library',
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      icon: Clock,
      action: () => {
        setActiveView('scheduled');
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      },
      isActive: activeView === 'scheduled',
    },
    {
      id: 'plugins',
      label: 'Plugins',
      icon: Puzzle,
      action: () => {
        setActiveView('plugins');
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      },
      isActive: activeView === 'plugins',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      action: () => {
        setActiveView('projects');
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      },
      isActive: activeView === 'projects',
    },
    {
      id: 'codex',
      label: 'Codex',
      icon: Code2,
      action: () => {
        setActiveView('codex');
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      },
      isActive: activeView === 'codex',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#293247] transition-all duration-300 ease-in-out select-none ${
          isSidebarOpen
            ? 'w-72 sm:w-80 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden'
        }`}
      >
        {/* ==========================================
            1. TOP: ChatBot AI Logo & Collapse Button
            ========================================== */}
        <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#293247]/60">
          <div
            onClick={() => {
              createNewChat();
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#818CF8] via-[#A78BFA] to-[#C084FC] p-[1.5px] shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#818CF8]" />
              </div>
            </div>
            <span className="font-bold text-base tracking-tight text-[#111827] dark:text-[#F3F4F6]">
              ChatBot <span className="gemini-gradient-text font-extrabold">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors focus:outline-none"
              title="Collapse sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==========================================
            2. MAIN NAVIGATION: 8 Requested Items
            ========================================== */}
        <nav className="p-3 space-y-1 border-b border-[#E2E8F0] dark:border-[#293247]/60" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.isActive;

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left focus:outline-none ${
                  item.highlight
                    ? isItemActive
                      ? 'bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white shadow-md shadow-indigo-500/20 font-semibold'
                      : 'bg-indigo-50/70 dark:bg-indigo-950/30 text-[#6366F1] dark:text-[#818CF8] border border-indigo-200/50 dark:border-indigo-500/20 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/50'
                    : isItemActive
                    ? 'bg-indigo-50 dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] font-semibold border-l-2 border-[#818CF8]'
                    : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    item.highlight && isItemActive
                      ? 'text-white'
                      : isItemActive
                      ? 'text-[#6366F1] dark:text-[#818CF8]'
                      : 'text-[#64748B] dark:text-[#9CA3AF]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* 8. More Menu Item with Compact Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left focus:outline-none ${
                isMoreMenuOpen
                  ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6]'
                  : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
              }`}
              title="More Options"
            >
              <div className="flex items-center gap-3">
                <Ellipsis className="w-4 h-4 shrink-0 text-[#64748B] dark:text-[#9CA3AF]" />
                <span>More</span>
              </div>
            </button>

            {/* Compact More Dropdown */}
            {isMoreMenuOpen && (
              <div className="absolute left-2 right-2 mt-1.5 rounded-2xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] shadow-xl py-1.5 z-50 animate-slide-up text-xs">
                <a
                  href="/admin"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#818CF8]" />
                  <span>Admin Portal</span>
                </a>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setActiveView('feedback');
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#818CF8]" />
                  <span>Feedback Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    openModal('help');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-[#818CF8]" />
                  <span>Help Center</span>
                </button>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    openModal('help');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <Keyboard className="w-4 h-4 text-[#818CF8]" />
                  <span>Keyboard Shortcuts</span>
                </button>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    openModal('about');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <Info className="w-4 h-4 text-[#818CF8]" />
                  <span>About ChatBot AI</span>
                </button>

                <div className="border-t border-[#E2E8F0] dark:border-[#293247] my-1" />

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    openModal('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <Sliders className="w-4 h-4 text-[#818CF8]" />
                  <span>Settings & Preferences</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ==========================================
            3. BOTTOM: Recent Conversations History
            ========================================== */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search box */}
          <div className="px-3 pt-3 pb-1.5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-[#64748B] dark:text-[#9CA3AF] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] placeholder:text-[#64748B] dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#818CF8] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Recent list header */}
          <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
            <span>Recent Chats</span>
            {filteredConversations.length > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#151C2C] text-[#818CF8]">
                {filteredConversations.length}
              </span>
            )}
          </div>

          {/* Independently scrollable conversation items */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                {searchQuery ? (
                  <p>No results found for "{searchQuery}"</p>
                ) : (
                  <p>No chat history yet</p>
                )}
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const isActive = activeView === 'chat' && chat.id === currentChatId;
                const isEditing = editingId === chat.id;
                const project = projects.find((p) => p.id === chat.projectId);

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      selectChat(chat.id);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] font-semibold border-l-2 border-[#818CF8]'
                        : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive
                            ? 'text-[#6366F1] dark:text-[#818CF8]'
                            : 'text-[#64748B] dark:text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#F3F4F6]'
                        }`}
                      />

                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(e, chat.id);
                            if (e.key === 'Escape') handleCancelRename(e);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white dark:bg-[#151C2C] px-1.5 py-0.5 rounded border border-[#818CF8] text-xs text-[#111827] dark:text-[#F3F4F6] focus:outline-none"
                        />
                      ) : (
                        <div className="min-w-0 flex-1">
                          <span className="truncate block leading-tight">{chat.title || 'Untitled Chat'}</span>
                          {project && (
                            <span
                              className="inline-block text-[9px] font-medium px-1.5 py-0.2 rounded mt-0.5"
                              style={{ color: project.color, backgroundColor: `${project.color}15` }}
                            >
                              {project.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Small compact action buttons on hover */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={(e) => handleSaveRename(e, chat.id)}
                            className="p-1 rounded text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            onClick={(e) => handleStartRename(e, chat)}
                            className="p-1 rounded text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#E2E8F0] dark:hover:bg-[#293247]"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {/* Small 14px-16px delete button with red hover state */}
                          <button
                            onClick={(e) => handleDeleteClick(e, chat)}
                            className="p-1 rounded text-[#64748B] hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==========================================
            4. FOOTER: Clear All, User Profile & Settings
            ========================================== */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#293247]/60 space-y-2">
          <button
            onClick={() => openModal('overallRating')}
            className="w-full flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-2.5 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/40"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>Rate ChatBot AI</span>
          </button>

          {conversations.length > 0 && (
            <button
              onClick={handleClearAllClick}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#64748B] dark:text-[#9CA3AF] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Clear Chat History</span>
            </button>
          )}

          {/* User Account / Login Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#818CF8] to-[#C084FC] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'E'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
                  {user ? user.name : 'Guest User'}
                </p>
                <p className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] truncate">
                  {user ? user.email : 'Free Mode'}
                </p>
              </div>
            </div>

            {user ? (
              <button
                onClick={logoutUser}
                className="p-1 rounded-lg text-[#64748B] hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm transition-all"
                title="Sign In or Register"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Sparkles,
  Plus,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  Menu,
  ChevronDown,
  Info,
  Sliders,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';

export function Navbar() {
  const {
    settings,
    updateSettings,
    createNewChat,
    openModal,
    isSidebarOpen,
    setIsSidebarOpen,
    showToast,
    user,
    setAuthModalOpen,
    setAuthMode,
    logoutUser,
  } = useChat();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    showToast(`Switched to ${nextTheme} mode`, 'info');
  };

  return (
    <header className="h-16 border-b border-[#E2E8F0] dark:border-[#293247] bg-white/90 dark:bg-[#0B1020]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Sidebar toggle + Brand Logo */}
      <div className="flex items-center gap-3">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all focus:outline-none"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo and Brand Title */}
        <div
          onClick={createNewChat}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#818CF8] via-[#A78BFA] to-[#C084FC] p-[1.5px] shadow-sm group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(129,140,248,0.35)] transition-all duration-200">
            <div className="w-full h-full bg-white dark:bg-[#0B1020] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#818CF8] group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-[#111827] dark:text-[#F3F4F6]">
              ChatBot <span className="gemini-gradient-text font-extrabold">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-[#151C2C] text-[#6366F1] dark:text-[#818CF8] border border-indigo-200/80 dark:border-[#293247]">
              Gemini AI
            </span>
          </div>
        </div>
      </div>

      {/* Center: Model Status Pill */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => openModal('settings')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-[#E2E8F0] dark:border-[#293247] bg-[#F8FAFC] dark:bg-[#151C2C] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6] transition-all hover:border-[#818CF8]/50 shadow-sm"
          title="Click to change model settings"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
          <span className="tracking-wide">{settings.selectedModel || 'gemini-3.1-flash-lite'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick New Chat Button */}
        <button
          onClick={createNewChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#F8FAFC] dark:bg-[#151C2C] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8]/50 text-[#111827] dark:text-[#F3F4F6] transition-all shadow-sm active:scale-95"
          title="Start a new conversation"
        >
          <Plus className="w-4 h-4 text-[#818CF8]" />
          <span className="hidden sm:inline font-medium">New Chat</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all focus:outline-none"
          title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Help Button */}
        <button
          onClick={() => openModal('help')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all focus:outline-none"
          title="Help & Shortcuts"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => openModal('settings')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all focus:outline-none"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar with dropdown */}
        <div className="relative ml-1" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#818CF8] to-[#C084FC] text-white font-semibold text-xs flex items-center justify-center shadow-sm hover:ring-2 hover:ring-[#818CF8]/40 transition-all focus:outline-none"
            title="User Profile"
            aria-label="User profile menu"
          >
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              settings.userName ? settings.userName.charAt(0).toUpperCase() : 'E'
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#151C2C] shadow-2xl border border-[#E2E8F0] dark:border-[#293247] py-2 z-50 animate-slide-up">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#293247]/80">
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] font-medium">Signed in as</p>
                <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
                  {user?.name || settings.userName || 'Explorer'}
                </p>
                {user?.email && (
                  <p className="mt-0.5 truncate text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                    {user.email}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {settings.useDemoMode ? 'Demo Mode Active' : 'Connected to Gemini AI'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    openModal('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <Sliders className="w-4 h-4 text-[#818CF8]" />
                  <span>Preferences & Model</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    openModal('about');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <Info className="w-4 h-4 text-[#818CF8]" />
                  <span>About ChatBot AI</span>
                </button>
              </div>

              <div className="border-t border-[#E2E8F0] dark:border-[#293247]/80 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    openModal('help');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-[#818CF8]" />
                  <span>Keyboard Shortcuts</span>
                </button>

                {user ? (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#6366F1] dark:text-[#818CF8] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors font-semibold"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

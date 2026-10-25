import React, { useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ChatArea } from './components/chat/ChatArea';
import { ImagesView } from './components/views/ImagesView';
import { LibraryView } from './components/views/LibraryView';
import { ScheduledView } from './components/views/ScheduledView';
import { PluginsView } from './components/views/PluginsView';
import { ProjectsView } from './components/views/ProjectsView';
import { CodexView } from './components/views/CodexView';
import { FeedbackDashboardView } from './components/views/FeedbackDashboardView';
import { SettingsModal } from './components/modals/SettingsModal';
import { AboutModal } from './components/modals/AboutModal';
import { HelpModal } from './components/modals/HelpModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { AuthModal } from './components/modals/AuthModal';
import { FeedbackModal } from './components/modals/FeedbackModal';
import { Toast } from './components/ui/Toast';
import { AdminPortal } from './components/admin/AdminPortal';
import { GoogleSignInPage } from './components/auth/GoogleSignInPage';

function ChatApp() {
  const { activeView, closeModal, activeModal } = useChat();

  // Global keyboard shortcuts (Esc to close modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1020] text-[#111827] dark:text-[#F3F4F6] font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container: Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {activeView === 'chat' && <ChatArea />}
          {activeView === 'images' && <ImagesView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'scheduled' && <ScheduledView />}
          {activeView === 'plugins' && <PluginsView />}
          {activeView === 'projects' && <ProjectsView />}
          {activeView === 'codex' && <CodexView />}
          {activeView === 'feedback' && <FeedbackDashboardView />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <SettingsModal />
      <AboutModal />
      <HelpModal />
      <ConfirmModal />
      <AuthModal />
      <FeedbackModal />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/signin') {
    return <GoogleSignInPage />;
  }

  if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
    return <AdminPortal />;
  }

  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
}

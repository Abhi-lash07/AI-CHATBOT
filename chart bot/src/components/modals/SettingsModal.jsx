import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { storageService } from '../../services/storageService';
import { geminiApi, AVAILABLE_MODELS } from '../../services/geminiApi';
import {
  X,
  Sliders,
  Key,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop,
  Download,
  Trash2,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';

export function SettingsModal() {
  const {
    activeModal,
    closeModal,
    settings,
    updateSettings,
    openModal,
    showToast,
  } = useChat();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'ai' | 'data'
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message?: string }

  // Local draft state
  const [draft, setDraft] = useState({
    theme: settings.theme,
    apiKey: settings.apiKey,
    selectedModel: settings.selectedModel,
    useDemoMode: settings.useDemoMode,
    temperature: settings.temperature,
    systemPrompt: settings.systemPrompt,
    userName: settings.userName,
  });

  if (activeModal !== 'settings') return null;

  const handleSave = () => {
    updateSettings(draft);
    closeModal();
  };

  const handleTestKey = async () => {
    if (!draft.apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }
    setTestingKey(true);
    setTestResult(null);

    const res = await geminiApi.testApiKey(draft.apiKey.trim(), draft.selectedModel);
    setTestingKey(false);
    setTestResult(res);
  };

  const handleExportJSON = () => {
    storageService.exportDataJSON();
    showToast('Exported all conversations as JSON', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#293247] rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl animate-slide-up overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-[#1E293B] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Settings</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-[#E2E8F0] dark:border-[#293247] px-6 bg-[#F8FAFC] dark:bg-[#0B1020]/60">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-[#818CF8] text-[#6366F1] dark:text-[#818CF8]'
                : 'border-transparent text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6]'
            }`}
          >
            General & Profile
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-[#818CF8] text-[#6366F1] dark:text-[#818CF8]'
                : 'border-transparent text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Model & API</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-[#818CF8] text-[#6366F1] dark:text-[#818CF8]'
                : 'border-transparent text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6]'
            }`}
          >
            Chat History & Data
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Appearance Theme
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Laptop },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = draft.theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDraft({ ...draft, theme: item.id })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Profile */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={draft.userName}
                    onChange={(e) => setDraft({ ...draft, userName: e.target.value })}
                    placeholder="Your name or nickname"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Used for personalizing greeting on the welcome screen and user avatar.
                </p>
              </div>

              {/* About summary card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                    About ChatBot AI
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    College UI/UX & Web Development Project inspired by Google Gemini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openModal('about')}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-500 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AI MODEL & API */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Demo Mode Toggle */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Free Demo Mode
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-600 text-white">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
                      When enabled, ChatBot AI responds using simulated, realistic Gemini responses without requiring an API key.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={draft.useDemoMode}
                      onChange={(e) => setDraft({ ...draft, useDemoMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* API Key Configuration */}
              <div className={`space-y-3 ${draft.useDemoMode ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Google Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Get free key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={draft.apiKey}
                    onChange={(e) => {
                      setDraft({ ...draft, apiKey: e.target.value });
                      setTestResult(null);
                    }}
                    placeholder="AIzaSy..."
                    className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={testingKey || !draft.apiKey.trim()}
                      className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[11px] font-semibold transition-colors disabled:opacity-50"
                    >
                      {testingKey ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                    }`}
                  >
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Key verified successfully! Ready to use.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{testResult.message || 'Key validation failed.'}</span>
                      </>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-slate-400">
                  🔒 Security: Your API key is stored strictly in your browser's LocalStorage and is never exposed or logged.
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Gemini Model Architecture
                </label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map((model) => {
                    const isSelected = draft.selectedModel === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => setDraft({ ...draft, selectedModel: model.id })}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {model.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {model.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Temperature Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Creativity (Temperature)
                  </label>
                  <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {draft.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={draft.temperature}
                  onChange={(e) => setDraft({ ...draft, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>0.0 (Precise / Code)</span>
                  <span>0.7 (Balanced)</span>
                  <span>1.0 (Creative / Fiction)</span>
                </div>
              </div>

              {/* System Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  System Persona Instructions
                </label>
                <textarea
                  rows={2}
                  value={draft.systemPrompt}
                  onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
                  placeholder="Custom assistant instructions..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Export Data */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Export Chat History
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Download all conversations and settings as a portable JSON file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Clear All History */}
              <div className="p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
                    Clear All Conversations
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Permanently delete all saved conversations from local storage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    openModal('clearConfirm');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#293247] flex items-center justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0B1020]/60">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

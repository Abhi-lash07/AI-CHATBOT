import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Puzzle,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

export function PluginsView() {
  const { plugins, togglePlugin, configurePlugin, showToast } = useChat();
  const [filter, setFilter] = useState('all'); // 'all' | 'connected' | 'available'
  const [configuringPlugin, setConfiguringPlugin] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);

  const filteredPlugins = plugins.filter((p) => {
    if (filter === 'connected') return p.status === 'connected';
    if (filter === 'available') return p.status === 'available';
    return true;
  });

  const handleOpenConfig = (plugin) => {
    setConfiguringPlugin(plugin);
    setTokenInput('');
    setShowToken(false);
  };

  const handleSaveConfig = () => {
    if (configuringPlugin) {
      if (tokenInput.trim()) {
        configurePlugin(configuringPlugin.id, {
          status: 'connected',
          details: `Configured with secret token (••••••••${tokenInput.trim().slice(-4)}).`,
        });
        showToast(`${configuringPlugin.name} configured successfully!`, 'success');
      } else {
        showToast('Configuration updated.', 'info');
      }
      setConfiguringPlugin(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1020] p-4 sm:p-6 md:p-8 animate-fade-in font-sans">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#151C2C] border border-indigo-200/60 dark:border-[#293247] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                <Puzzle className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                Plugins & Integrations
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Extend ChatBot AI capabilities with vision engines, code sandboxes, search grounding, and developer APIs.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {['all', 'connected', 'available'].map((tab) => (
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
        </div>

        {/* Plugins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPlugins.map((plugin) => {
            const isConnected = plugin.status === 'connected';

            return (
              <div
                key={plugin.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8] dark:hover:border-[#818CF8] p-5 shadow-sm hover:shadow-[0_8px_25px_-5px_rgba(129,140,248,0.2)] transition-all duration-200"
              >
                <div>
                  {/* Card Header: Icon, Name & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#1E293B] border border-indigo-200/50 dark:border-[#293247] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8] shrink-0">
                        <Puzzle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-[#111827] dark:text-[#F3F4F6]">
                          {plugin.name}
                        </h3>
                        <span className="text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF]">
                          {plugin.category}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isConnected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-indigo-50 dark:bg-indigo-950/30 text-[#6366F1] dark:text-[#818CF8] border-indigo-200/60 dark:border-[#293247]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-[#818CF8]'
                        }`}
                      />
                      <span>{isConnected ? 'Connected' : 'Available'}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-3 leading-relaxed">
                    {plugin.description}
                  </p>

                  {/* Capabilities tags */}
                  {plugin.capabilities && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {plugin.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F8FAFC] dark:bg-[#0B1020] text-[#111827] dark:text-[#F3F4F6] border border-[#E2E8F0] dark:border-[#293247]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Details summary */}
                  {plugin.details && (
                    <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] mt-3 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247]/60">
                      ℹ️ {plugin.details}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between gap-3 mt-5 pt-3.5 border-t border-[#E2E8F0] dark:border-[#293247]/60">
                  {plugin.configurable ? (
                    <button
                      onClick={() => handleOpenConfig(plugin)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#818CF8] hover:text-[#6366F1] transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure Settings</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                      Native Extension
                    </span>
                  )}

                  <button
                    onClick={() => togglePlugin(plugin.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isConnected
                        ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#9CA3AF] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Modal */}
        {configuringPlugin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="rounded-3xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] max-w-md w-full p-6 shadow-2xl animate-slide-up space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#293247]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#818CF8]" />
                  <h3 className="font-bold text-base text-[#111827] dark:text-[#F3F4F6]">
                    Configure {configuringPlugin.name}
                  </h3>
                </div>
                <button
                  onClick={() => setConfiguringPlugin(null)}
                  className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-[#111827] dark:text-[#F3F4F6]">
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] leading-relaxed">
                  Enter your credentials or API token to activate this plugin. Tokens are encrypted and never exposed in browser logs.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1">
                    API Key / Access Token
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Paste token or key here..."
                      className="w-full pl-3 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF]"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-[#0B1020] border border-indigo-200/50 dark:border-[#293247] text-xs text-[#64748B] dark:text-[#9CA3AF] space-y-1">
                  <p className="font-semibold text-[#6366F1] dark:text-[#818CF8]">Security Notice:</p>
                  <p>All sensitive credentials are saved locally or in the backend environment variables.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfiguringPlugin(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

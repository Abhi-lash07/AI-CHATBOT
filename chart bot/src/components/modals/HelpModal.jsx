import React from 'react';
import { useChat } from '../../context/ChatContext';
import {
  HelpCircle,
  X,
  Keyboard,
  Sparkles,
  Command,
  ArrowRight,
  Code2,
  BookOpen,
  Briefcase,
  Compass,
  Lightbulb
} from 'lucide-react';

export function HelpModal() {
  const { activeModal, closeModal, sendMessage } = useChat();

  if (activeModal !== 'help') return null;

  const shortcuts = [
    { key: 'Enter', action: 'Send your current message' },
    { key: 'Shift + Enter', action: 'Insert a new line in the input box' },
    { key: 'Esc', action: 'Close active modal / dialog' },
  ];

  const examplePrompts = [
    {
      category: 'Coding & Debugging',
      icon: Code2,
      color: 'text-blue-500',
      prompts: [
        'Write a clean React custom hook for debouncing search input with examples.',
        'Explain the difference between synchronous and asynchronous JavaScript with code.',
        'How do I implement Tailwind CSS dark mode with localStorage in React?',
      ],
    },
    {
      category: 'Science & Concepts',
      icon: BookOpen,
      color: 'text-emerald-500',
      prompts: [
        'Explain quantum computing in simple terms with analogies.',
        'How does the transformer architecture in modern LLMs work step-by-step?',
        'What is the event horizon of a black hole and why can nothing escape?',
      ],
    },
    {
      category: 'Creativity & Writing',
      icon: Compass,
      color: 'text-purple-500',
      prompts: [
        'Write a creative sci-fi story about an AI exploring deep space.',
        'Draft a persuasive, professional email proposing a new AI feature.',
        'Create a compelling hook and outline for a tech blog post about UI design.',
      ],
    },
    {
      category: 'Project Ideation',
      icon: Lightbulb,
      color: 'text-amber-500',
      prompts: [
        'Generate 5 innovative web app project ideas with modern tech stacks.',
        'Brainstorm interactive portfolio project concepts for computer science students.',
        'Suggest unique full-stack applications solving daily productivity problems.',
      ],
    },
  ];

  const handleTryPrompt = (prompt) => {
    closeModal();
    sendMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#293247] rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-[#1E293B] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Help & Guide</h2>
              <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]">Master ChatBot AI in seconds</span>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {/* How to use */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              How to Use ChatBot AI
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center mb-2">
                  1
                </span>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
                  Ask Anything
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Type questions, request code solutions, or attach image/text files for evaluation.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center mb-2">
                  2
                </span>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
                  Demo or Live API
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Use built-in Demo Mode out-of-the-box, or add your Google Gemini API key in Settings.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center mb-2">
                  3
                </span>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
                  Manage History
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Search, rename, delete, or export conversations saved securely in your browser.
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Keyboard className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Keyboard Shortcuts
              </h3>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
              {shortcuts.map((sc, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2.5 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-850 dark:bg-slate-800/30"
                >
                  <span className="text-slate-600 dark:text-slate-300">{sc.action}</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Example Prompts by Category */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Inspiration Prompts (Click any to send immediately)
            </h3>
            <div className="space-y-4">
              {examplePrompts.map((group, idx) => {
                const Icon = group.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Icon className={`w-3.5 h-3.5 ${group.color}`} />
                      <span>{group.category}</span>
                    </div>
                    <div className="space-y-1.5">
                      {group.prompts.map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleTryPrompt(promptText)}
                          className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between group transition-all"
                        >
                          <span className="truncate pr-3">{promptText}</span>
                          <span className="shrink-0 text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] transition-opacity">
                            Try this <ArrowRight className="w-3 h-3" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-950/40">
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

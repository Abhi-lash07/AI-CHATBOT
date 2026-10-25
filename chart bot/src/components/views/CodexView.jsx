import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { apiService } from '../../services/apiService';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  Code2,
  Sparkles,
  Bug,
  Zap,
  BookOpen,
  Copy,
  Check,
  RotateCw,
  Bookmark,
  MessageSquare,
  Play,
  Square,
  Terminal,
  Trash2,
  FileCode,
  Layers,
} from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'sql', name: 'SQL' },
  { id: 'html', name: 'HTML & CSS' },
  { id: 'shell', name: 'Shell / Bash' },
];

const MODES = [
  { id: 'generate', label: 'Generate', icon: Sparkles, desc: 'Write new functions, classes, or scripts from a prompt' },
  { id: 'debug', label: 'Debug & Fix', icon: Bug, desc: 'Find logic errors, edge cases, and memory leaks' },
  { id: 'refactor', label: 'Refactor', icon: Zap, desc: 'Optimize complexity, clean up architecture & readability' },
  { id: 'explain', label: 'Explain', icon: BookOpen, desc: 'Break down complex algorithms step-by-step' },
];

const PROMPT_CHIPS = [
  { label: 'REST API Controller', lang: 'javascript', prompt: 'Create an Express.js REST API controller with CRUD routes, input validation, and proper error handling.' },
  { label: 'Debounce Hook', lang: 'typescript', prompt: 'Write a type-safe custom React useDebounce hook with cleanup and customizable delay in milliseconds.' },
  { label: 'Binary Search Tree', lang: 'python', prompt: 'Implement a Binary Search Tree with insert, search, delete, and in-order traversal methods.' },
  { label: 'JWT Auth Middleware', lang: 'javascript', prompt: 'Write an Express middleware to verify JWT tokens with Bearer authorization and token expiration checks.' },
  { label: 'SQL Aggregation', lang: 'sql', prompt: 'Write an optimized SQL query with GROUP BY, HAVING, and window functions to calculate monthly revenue trends.' },
  { label: 'Async Retry with Exponential Backoff', lang: 'typescript', prompt: 'Write a generic async retry utility with exponential backoff and jitter in TypeScript.' },
];

export function CodexView() {
  const {
    settings,
    saveToLibrary,
    createNewChat,
    sendMessage,
    showToast,
  } = useChat();

  const [language, setLanguage] = useState('javascript');
  const [mode, setMode] = useState('generate');
  const [instruction, setInstruction] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToLib, setSavedToLib] = useState(false);

  const abortControllerRef = useRef(null);

  const handleApplyChip = (chip) => {
    setLanguage(chip.lang);
    setInstruction(chip.prompt);
  };

  const handleRunCodex = async () => {
    if (!instruction.trim() && !codeContext.trim()) {
      showToast('Please provide an instruction or code snippet.', 'error');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setSavedToLib(false);

    let systemContext = `You are Codex AI, an elite software engineering assistant specializing in clean, idiomatic, and highly performant ${language} code.\n`;
    let userPrompt = '';

    if (mode === 'generate') {
      systemContext += 'Provide production-grade code with brief explanations, docstrings, and edge-case handling.';
      userPrompt = `Language: ${language}\nTask:\n${instruction.trim()}`;
    } else if (mode === 'debug') {
      systemContext += 'Locate any syntax errors, logic bugs, race conditions, or performance pitfalls. Provide the corrected code followed by a bullet-point diagnosis.';
      userPrompt = `Language: ${language}\nGoal: ${instruction || 'Debug and fix the following code'}\n\nCode to inspect:\n\`\`\`${language}\n${codeContext.trim()}\n\`\`\``;
    } else if (mode === 'refactor') {
      systemContext += 'Refactor the given code to improve maintainability, speed, and standard idiomatic conventions while preserving exact functional behavior.';
      userPrompt = `Language: ${language}\nRefactoring Goals: ${instruction || 'Refactor for optimal performance and clarity'}\n\nOriginal Code:\n\`\`\`${language}\n${codeContext.trim()}\n\`\`\``;
    } else if (mode === 'explain') {
      systemContext += 'Explain the code thoroughly: step-by-step logic, time/space complexity, and architecture.';
      userPrompt = `Language: ${language}\nQuestions: ${instruction || 'Explain how this code works'}\n\nCode to explain:\n\`\`\`${language}\n${codeContext.trim()}\n\`\`\``;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await apiService.streamChat({
        messages: [{ role: 'user', content: userPrompt }],
        model: settings.selectedModel,
        systemPrompt: systemContext,
        temperature: 0.2, // Low temperature for precise code generation
        apiKey: settings.apiKey,
        onChunk: (accumulated) => {
          setOutput(accumulated);
        },
        signal: abortController.signal,
      });
      showToast('Code generated successfully!', 'success');
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('cancelled')) {
        showToast('Generation stopped', 'info');
      } else {
        console.error('Codex error:', err);
        setOutput((prev) => prev + `\n\n⚠️ **Error:** ${err.message || 'Failed to generate code.'}`);
        showToast('Generation failed: ' + (err.message || 'Error'), 'error');
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRunning(false);
    }
  };

  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    showToast('Copied code output to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!output) return;
    const title = instruction.trim().slice(0, 36) || `Codex ${language.toUpperCase()} Snippet`;
    saveToLibrary({
      title,
      content: output,
      category: 'Code',
    });
    setSavedToLib(true);
    setTimeout(() => setSavedToLib(false), 2500);
  };

  const handleOpenInChat = () => {
    if (!output) return;
    createNewChat();
    // After switching to chat, prompt with the generated code
    sendMessage(`Here is the ${language} code from Codex:\n\n${output}\n\nCan you analyze and suggest tests for this?`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1020] p-4 sm:p-6 md:p-8 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#151C2C] border border-indigo-200/60 dark:border-[#293247] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                <Code2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                Codex AI Coding Suite
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Multi-language code synthesis, algorithmic optimization, bug diagnosis, and architecture explanations.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-[#818CF8]" /> Language:
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-white dark:bg-[#151C2C] border-[#818CF8] text-[#818CF8] shadow-sm'
                    : 'bg-white/60 dark:bg-[#111827]/60 border-[#E2E8F0] dark:border-[#293247] text-[#64748B] dark:text-[#9CA3AF] hover:border-[#818CF8]/40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#818CF8]'
                      : 'bg-slate-100 dark:bg-[#1E293B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{m.label}</p>
                  <p className="text-[10px] text-[#94A3B8] dark:text-[#64748B] line-clamp-1 mt-0.5">
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Template Chips */}
        <div>
          <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider mb-2 block">
            Quick Architecture Templates
          </span>
          <div className="flex flex-wrap gap-2">
            {PROMPT_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyChip(chip)}
                className="px-3 py-1 rounded-full text-xs bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8] text-[#64748B] dark:text-[#9CA3AF] hover:text-[#818CF8] transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Workstation: Inputs & Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Input Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <label className="block text-xs font-bold text-[#111827] dark:text-[#F3F4F6]">
                {mode === 'generate'
                  ? 'Prompt & Requirements'
                  : mode === 'debug'
                  ? 'Bug Description or Error Message'
                  : mode === 'refactor'
                  ? 'Refactoring Objectives'
                  : 'Questions / Clarifications'}
              </label>

              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={
                  mode === 'generate'
                    ? 'e.g. Write a thread-safe connection pool manager with auto-reconnect...'
                    : mode === 'debug'
                    ? 'e.g. This code throws TypeError: Cannot read properties of undefined...'
                    : 'Describe what you need Codex to achieve...'
                }
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:border-[#818CF8] transition-colors resize-none font-sans"
              />

              {/* Existing Code Area (for debug, refactor, explain) */}
              {mode !== 'generate' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111827] dark:text-[#F3F4F6]">
                      Existing Code to Process
                    </label>
                    <span className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] font-mono">
                      {codeContext.split('\n').length} lines
                    </span>
                  </div>
                  <textarea
                    value={codeContext}
                    onChange={(e) => setCodeContext(e.target.value)}
                    placeholder={`// Paste your ${language} code here...`}
                    rows={8}
                    className="w-full p-3.5 rounded-xl text-xs bg-[#0B1020] border border-[#293247] text-[#818CF8] font-mono focus:outline-none focus:border-[#818CF8] transition-colors resize-none"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInstruction('');
                    setCodeContext('');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
                >
                  Clear Inputs
                </button>

                {isRunning ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Generating</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunCodex}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate Solution</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Output Panel */}
          <div className="flex flex-col min-h-[460px] bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] rounded-2xl shadow-sm overflow-hidden">
            {/* Output Header */}
            <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#293247] flex items-center justify-between gap-2 bg-[#F8FAFC] dark:bg-[#111827]/60">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#818CF8]" />
                <span className="text-xs font-bold text-[#111827] dark:text-[#F3F4F6]">
                  Codex Output
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-indigo-50 dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] border border-indigo-200/60 dark:border-[#293247]">
                  {language}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {output && (
                  <>
                    <button
                      onClick={handleCopyOutput}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
                      title="Copy code"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleSaveToLibrary}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
                      title="Save to Library"
                    >
                      {savedToLib ? <Check className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleOpenInChat}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
                      title="Open in Full Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setOutput('')}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
                      title="Clear output"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Output Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto font-sans leading-relaxed text-sm">
              {isRunning && !output ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[#818CF8] animate-pulse">
                    <Sparkles className="w-5 h-5 animate-spin" />
                  </div>
                  <p className="text-xs font-semibold text-[#818CF8]">
                    Codex is synthesizing {language} solution...
                  </p>
                </div>
              ) : output ? (
                <MarkdownRenderer content={output} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 text-[#64748B] dark:text-[#9CA3AF] space-y-2">
                  <Code2 className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-medium">Ready to compile solutions.</p>
                  <p className="text-[11px] opacity-75 max-w-xs">
                    Choose a mode, pick your programming language, and click "Generate Solution".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

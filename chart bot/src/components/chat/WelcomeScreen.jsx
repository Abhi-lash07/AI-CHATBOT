import React from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Sparkles,
  BookOpen,
  PenTool,
  Code2,
  Lightbulb,
} from 'lucide-react';

export function WelcomeScreen({ onSelectPrompt }) {
  const { settings } = useChat();
  const userName = settings.userName || 'Explorer';

  const suggestions = [
    {
      id: 'explain',
      category: 'Explain Concept',
      prompt: 'Explain quantum computing in simple terms with real-world analogies',
      icon: BookOpen,
      iconColor: 'text-[#818CF8]',
      badgeBg: 'bg-indigo-50 dark:bg-[#1E293B] border-indigo-200/60 dark:border-[#818CF8]/30',
    },
    {
      id: 'story',
      category: 'Creative Story',
      prompt: 'Write a creative sci-fi story about an AI exploring deep space and ancient artifacts',
      icon: PenTool,
      iconColor: 'text-[#C084FC]',
      badgeBg: 'bg-purple-50 dark:bg-[#1E293B] border-purple-200/60 dark:border-[#C084FC]/30',
    },
    {
      id: 'code',
      category: 'Write Code',
      prompt: 'Help me write a reusable React hook for debouncing search input with examples',
      icon: Code2,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-[#1E293B] border-emerald-200/60 dark:border-emerald-500/30',
    },
    {
      id: 'ideas',
      category: 'Generate Ideas',
      prompt: 'Generate 5 innovative web app project ideas with modern tech stacks for students',
      icon: Lightbulb,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-[#1E293B] border-amber-200/60 dark:border-amber-500/30',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full select-none animate-fade-in my-auto">
      {/* Centered Welcome Heading */}
      <div className="text-center w-full mb-8 sm:mb-12 space-y-3">
        <h1 className="text-4xl sm:text-5xl md:text-[56px] lg:text-[60px] font-bold tracking-tight leading-[1.15]">
          <span className="gemini-gradient-text block">
            Hello, {userName}
          </span>
          <span className="text-[#111827] dark:text-[#F3F4F6] block mt-1">
            How can I help you today?
          </span>
        </h1>
        <p className="text-base sm:text-lg text-[#64748B] dark:text-[#9CA3AF] max-w-xl mx-auto pt-1 font-normal leading-relaxed">
          Ask questions, brainstorm concepts, write code, or explore ideas.
        </p>
      </div>

      {/* Suggestion Cards: 4 cards arranged horizontally on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {suggestions.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onSelectPrompt(card.prompt)}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8] dark:hover:border-[#818CF8] text-left transition-all duration-200 h-40 sm:h-44 shadow-sm hover:shadow-[0_10px_25px_-5px_rgba(129,140,248,0.2)] hover:-translate-y-1.5 active:scale-[0.98]"
            >
              <p className="text-sm font-normal text-[#111827] dark:text-[#F3F4F6] leading-relaxed line-clamp-4 group-hover:text-[#6366F1] dark:group-hover:text-white transition-colors">
                {card.prompt}
              </p>

              <div className="flex items-center justify-between w-full pt-3">
                <span className="text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF] group-hover:text-[#818CF8] transition-colors">
                  {card.category}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm transition-all group-hover:scale-105 ${card.badgeBg}`}
                >
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle indicator */}
      <div className="mt-8 sm:mt-10 flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
        <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
        <span>ChatBot AI • Connected to Google Gemini</span>
      </div>
    </div>
  );
}

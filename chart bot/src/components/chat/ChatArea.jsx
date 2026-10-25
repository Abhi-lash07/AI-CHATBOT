import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { ArrowDown } from 'lucide-react';

export function ChatArea() {
  const {
    currentMessages,
    sendMessage,
    isGenerating,
  } = useChat();

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll when messages change or streaming
  useEffect(() => {
    scrollToBottom(isGenerating ? 'auto' : 'smooth');
  }, [currentMessages, isGenerating]);

  // Track scroll position to show "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isFarFromBottom);
  };

  const handleSelectPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const hasMessages = currentMessages && currentMessages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F8FAFC] dark:bg-[#0B1020] transition-colors duration-200">
      {/* Scrollable messages container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-4 flex flex-col"
      >
        {!hasMessages ? (
          <WelcomeScreen onSelectPrompt={handleSelectPrompt} />
        ) : (
          <div className="max-w-4xl mx-auto w-full flex-1">
            {currentMessages.map((msg, index) => {
              return (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                />
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-28 right-8 p-2.5 rounded-full bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] shadow-xl text-[#111827] dark:text-[#F3F4F6] hover:text-[#6366F1] dark:hover:text-[#818CF8] hover:border-[#818CF8]/50 hover:scale-105 active:scale-95 transition-all z-20"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Fixed Chat Input Container at bottom with subtle gradient fade */}
      <div className="w-full shrink-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent dark:from-[#0B1020] dark:via-[#0B1020]/95 dark:to-transparent pt-2">
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}

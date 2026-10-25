import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  Sparkles,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  FileText,
  AlertCircle,
  Bookmark,
  MessageSquare,
} from 'lucide-react';

export function MessageItem({ message }) {
  const {
    regenerateResponse,
    isGenerating,
    saveToLibrary,
    showToast,
    feedback,
    currentChatId,
    saveResponseFeedback,
    openModal,
  } = useChat();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const responseFeedback = feedback.find(
    (item) =>
      item.type === 'response' &&
      item.conversationId === currentChatId &&
      item.responseId === message.id
  );

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    showToast('Copied message to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex justify-end my-5 animate-fade-in group">
        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end">
          {/* Attached files preview in user message */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.files.map((file, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#293247] bg-white dark:bg-[#151C2C] p-1.5 shadow-sm"
                >
                  {file.type?.startsWith('image/') ? (
                    <img
                      src={file.data}
                      alt={file.name}
                      className="max-h-56 max-w-full rounded-xl object-contain border border-[#E2E8F0] dark:border-[#293247]"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#111827] dark:text-[#F3F4F6]">
                      <FileText className="w-4 h-4 text-[#818CF8]" />
                      <span className="truncate max-w-[160px]">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* User message bubble */}
          <div className="bg-[#F1F5F9] dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6] rounded-2xl rounded-br-sm px-5 py-3.5 shadow-sm border border-[#E2E8F0] dark:border-[#293247] text-base leading-[1.7] break-words whitespace-pre-wrap font-sans">
            {message.content}
          </div>

          {/* User message timestamp */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#64748B] dark:text-[#9CA3AF] px-1.5">
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    );
  }

  // AI Message (Left Aligned Premium Layout)
  return (
    <div className="flex items-start gap-3.5 sm:gap-4 my-7 animate-fade-in group">
      {/* Indigo & Violet Gradient Avatar */}
      <div className="shrink-0 mt-0.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#818CF8] via-[#A78BFA] to-[#C084FC] p-[1.5px] shadow-sm">
          <div className="w-full h-full bg-white dark:bg-[#0B1020] rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#818CF8]" />
          </div>
        </div>
      </div>

      {/* Message Content Container */}
      <div className="flex-1 min-w-0 max-w-[94%] sm:max-w-[90%]">
        {/* Header name and timestamp */}
        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">ChatBot AI</span>
          <span className="text-[#64748B] dark:text-[#9CA3AF] text-[11px]">{formattedTime}</span>
          {message.isError && (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium ml-1">
              <AlertCircle className="w-3.5 h-3.5" /> Error
            </span>
          )}
        </div>

        {/* Message body */}
        <div className="text-base leading-[1.7] text-[#111827] dark:text-[#F3F4F6]">
          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : isStreaming ? (
            /* Pulsing wave dots */
            <div className="flex items-center gap-2 py-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#818CF8] animate-dot-1" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-dot-2" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#C084FC] animate-dot-3" />
              <span className="text-xs text-[#64748B] dark:text-[#9CA3AF] ml-2 font-medium">
                Generating response...
              </span>
            </div>
          ) : null}

          {/* Active streaming cursor */}
          {isStreaming && message.content && (
            <span className="inline-block w-2 h-4 ml-1.5 bg-[#818CF8] animate-pulse rounded-sm align-middle" />
          )}
        </div>

        {/* AI Action Toolbar */}
        {!isStreaming && message.content && (
          <div className="flex items-center gap-1 mt-4 pt-1 text-[#64748B] dark:text-[#9CA3AF] text-xs">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#111827] dark:hover:text-[#F3F4F6] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all"
              title="Copy entire response"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 text-xs font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Copy</span>
                </>
              )}
            </button>

            {/* Save to Library Button */}
            <button
              onClick={() => {
                saveToLibrary({ content: message.content, category: 'AI Responses' });
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#111827] dark:hover:text-[#F3F4F6] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all"
              title="Save this response to your Library"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 text-xs font-medium">Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Save to Library</span>
                </>
              )}
            </button>

            {/* Regenerate Button */}
            <button
              onClick={() => regenerateResponse(message.id)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#111827] dark:hover:text-[#F3F4F6] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all disabled:opacity-40"
              title="Regenerate this response"
              aria-label="Regenerate this response"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="text-xs font-medium">Regenerate</span>
            </button>

            <button
              onClick={() =>
                openModal('responseFeedback', {
                  conversationId: currentChatId,
                  responseId: message.id,
                  responseContent: message.content,
                  feedback: responseFeedback || null,
                  thumbsRating: responseFeedback?.thumbsRating ?? null,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#111827] dark:hover:text-[#F3F4F6] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all"
              title="Share detailed feedback"
              aria-label="Share detailed feedback"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Feedback</span>
            </button>

            {/* Thumbs Up */}
            <button
              onClick={async () => {
                try {
                  await saveResponseFeedback({
                  conversationId: currentChatId,
                  responseId: message.id,
                  responseContent: message.content,
                  thumbsRating: true,
                  });
                  showToast('Thanks for your feedback!', 'success');
                } catch (error) {
                  showToast(`Feedback could not be submitted: ${error.message}`, 'error');
                }
              }}
              className={`p-1.5 rounded-full hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors ${
                responseFeedback?.thumbsRating === true
                  ? 'text-[#6366F1] dark:text-[#818CF8] bg-indigo-50 dark:bg-indigo-950/60'
                  : 'hover:text-[#111827] dark:hover:text-[#F3F4F6]'
              }`}
              title="Helpful response"
              aria-label="Helpful response"
              aria-pressed={responseFeedback?.thumbsRating === true}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            {/* Thumbs Down */}
            <button
              onClick={() =>
                openModal('responseFeedback', {
                  conversationId: currentChatId,
                  responseId: message.id,
                  responseContent: message.content,
                  feedback: responseFeedback || null,
                  thumbsRating: false,
                })
              }
              className={`p-1.5 rounded-full hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors ${
                responseFeedback?.thumbsRating === false
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60'
                  : 'hover:text-[#111827] dark:hover:text-[#F3F4F6]'
              }`}
              title="Unhelpful response"
              aria-label="Unhelpful response"
              aria-pressed={responseFeedback?.thumbsRating === false}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

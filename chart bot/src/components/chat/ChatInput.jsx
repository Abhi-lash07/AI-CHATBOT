import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';

export function ChatInput({ onSendMessage }) {
  const { isGenerating, stopGenerating, showToast } = useChat();
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak now', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        showToast(`Mic error: ${event.error}`, 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-resize textarea to fit content cleanly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 42), 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isGenerating) {
      stopGenerating();
      return;
    }

    if (!input.trim() && attachedFiles.length === 0) return;

    onSendMessage(input, attachedFiles);
    setInput('');
    setAttachedFiles([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedImageMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    files.forEach((file) => {
      // Validate file format for images
      if (file.type && !file.type.startsWith('image/') && !file.name.match(/\.(txt|md|json|js|py|html|css)$/i)) {
        showToast(`Unsupported file type: "${file.name}". Supported: PNG, JPG, JPEG, WEBP.`, 'error');
        return;
      }

      if (file.type?.startsWith('image/') && !allowedImageMimeTypes.includes(file.type)) {
        showToast(`Please upload PNG, JPG, JPEG, or WEBP image format.`, 'error');
        return;
      }

      // Max 15MB
      if (file.size > 15 * 1024 * 1024) {
        showToast(`File "${file.name}" is too large (max 15MB)`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'image/png',
            size: file.size,
            data: event.target.result,
          },
        ]);
        showToast(`Attached "${file.name}"`, 'success');
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (idx) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition is not supported in this browser.', 'info');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const hasContent = input.trim().length > 0 || attachedFiles.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-4 pt-1">
      {/* Attached file preview tags */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5 p-2.5 rounded-2xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] max-h-36 overflow-y-auto shadow-sm">
          {attachedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-xs shadow-sm"
            >
              {file.type?.startsWith('image/') ? (
                <img
                  src={file.data}
                  alt={file.name}
                  className="w-8 h-8 rounded-lg object-cover border border-[#E2E8F0] dark:border-[#293247]"
                />
              ) : (
                <FileText className="w-4 h-4 text-[#818CF8] shrink-0" />
              )}
              <span className="truncate max-w-[140px] font-medium text-[#111827] dark:text-[#F3F4F6]">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 rounded-lg text-[#64748B] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rounded Rectangular Input Container with Electric Indigo Focus */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] focus-within:border-[#818CF8] dark:focus-within:border-[#818CF8] focus-within:ring-2 focus-within:ring-[#818CF8]/20 focus-within:shadow-[0_0_25px_-5px_rgba(129,140,248,0.25)] shadow-md transition-all duration-200 px-4 sm:px-5 pt-3 pb-2.5">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/jpg,.png,.jpg,.jpeg,.webp,.txt,.md,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, write code, or attach an image..."
          className="w-full bg-transparent resize-none text-sm sm:text-base text-[#111827] dark:text-[#F3F4F6] placeholder:text-[#64748B] dark:placeholder:text-[#9CA3AF] focus:outline-none max-h-44 leading-relaxed overflow-y-auto block mb-1 font-sans"
        />

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-[#293247]/50">
          {/* Left: Attachment button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-[#64748B] dark:text-[#9CA3AF] hover:text-[#6366F1] dark:hover:text-[#818CF8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors focus:outline-none flex items-center justify-center group"
              title="Attach image or file"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
            </button>
          </div>

          {/* Right: Microphone & Send button */}
          <div className="flex items-center gap-2">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl transition-all focus:outline-none ${
                isListening
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 animate-pulse'
                  : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
              }`}
              title={isListening ? 'Stop voice recording' : 'Voice input'}
              aria-label="Microphone"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send / Stop Button with Indigo-to-Violet Accent */}
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGenerating}
                className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-rose-600/30"
                title="Stop generation"
                aria-label="Stop response"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!hasContent}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  hasContent
                    ? 'bg-gradient-to-r from-[#818CF8] to-[#C084FC] hover:from-[#6366F1] hover:to-[#A855F7] text-white shadow-md shadow-indigo-500/30 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'text-[#64748B]/40 dark:text-[#9CA3AF]/30 cursor-not-allowed bg-slate-100 dark:bg-[#1E293B]/50'
                }`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Disclaimer */}
      <p className="mt-2 text-center text-xs text-[#64748B] dark:text-[#9CA3AF] select-none">
        ChatBot AI can make mistakes. Verify important info.
      </p>
    </div>
  );
}

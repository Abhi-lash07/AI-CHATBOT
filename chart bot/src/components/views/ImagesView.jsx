import React, { useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Images,
  UploadCloud,
  MessageSquare,
  Trash2,
  Sparkles,
  FileImage,
  Info,
  Calendar,
  HardDrive,
} from 'lucide-react';

export function ImagesView() {
  const {
    images,
    addImage,
    deleteImage,
    startChatWithImage,
    openModal,
    showToast,
  } = useChat();

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedMime = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    files.forEach((file) => {
      if (!allowedMime.includes(file.type)) {
        showToast(`Unsupported format: "${file.name}". Please upload PNG, JPG, JPEG, or WEBP.`, 'error');
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        showToast(`File "${file.name}" exceeds 15MB size limit.`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        addImage({
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target.result,
        });
      };
      reader.onerror = () => {
        showToast(`Failed to read "${file.name}".`, 'error');
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1020] p-4 sm:p-6 md:p-8 animate-fade-in font-sans">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#151C2C] border border-indigo-200/60 dark:border-[#293247] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                <Images className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                Images & Vision Gallery
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Upload and manage images for Gemini multimodal analysis (supports PNG, JPG, JPEG, WEBP).
            </p>
          </div>

          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>

        {/* Upload Zone / Notice Banner */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8] dark:hover:border-[#818CF8] rounded-2xl p-6 text-center cursor-pointer bg-white/50 dark:bg-[#151C2C]/50 hover:bg-indigo-50/20 dark:hover:bg-[#1E293B]/30 transition-all group"
        >
          <UploadCloud className="w-8 h-8 mx-auto text-[#64748B] dark:text-[#9CA3AF] group-hover:text-[#818CF8] group-hover:scale-110 transition-all mb-2" />
          <p className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">
            Click to browse or drop images here
          </p>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1">
            PNG, JPG, JPEG, or WEBP up to 15MB each
          </p>
        </div>

        {/* Image Grid / Empty State */}
        {images.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] rounded-2xl shadow-sm space-y-3">
            <FileImage className="w-12 h-12 mx-auto text-[#64748B]/40 dark:text-[#9CA3AF]/40" />
            <h3 className="text-base font-semibold text-[#111827] dark:text-[#F3F4F6]">No images in your library yet</h3>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] max-w-md mx-auto">
              Upload screenshots, certificates, diagrams, or diagrams to test Gemini's image understanding.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select Your First Image</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {images.map((img) => (
              <div
                key={img.id}
                className="group flex flex-col rounded-2xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8] dark:hover:border-[#818CF8] overflow-hidden shadow-sm hover:shadow-[0_8px_25px_-5px_rgba(129,140,248,0.2)] transition-all duration-200"
              >
                {/* Image Preview Container */}
                <div className="relative h-44 w-full bg-[#0E1526] overflow-hidden flex items-center justify-center border-b border-[#E2E8F0] dark:border-[#293247]">
                  <img
                    src={img.data}
                    alt={img.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* File Type Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {img.type ? img.type.replace('image/', '') : 'PNG'}
                  </span>
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#111827] dark:text-[#F3F4F6] truncate" title={img.name}>
                      {img.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        {formatFileSize(img.size)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(img.uploadedAt || Date.now())}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#293247]/60">
                    <button
                      onClick={() => startChatWithImage(img)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#818CF8] dark:hover:text-[#0B1020] border border-indigo-200/60 dark:border-[#293247] transition-all"
                      title="Open in chat to analyze with Gemini"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Gemini</span>
                    </button>

                    {/* Small Delete Button */}
                    <button
                      onClick={() => openModal('deleteImageConfirm', img)}
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

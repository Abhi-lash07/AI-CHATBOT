import React from 'react';
import { useChat } from '../../context/ChatContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export function ConfirmModal() {
  const {
    activeModal,
    modalData,
    closeModal,
    deleteChat,
    clearAllChats,
    deleteImage,
    deleteLibraryItem,
    deleteScheduledItem,
    deleteProject,
  } = useChat();

  const confirmedModalTypes = [
    'clearConfirm',
    'deleteConfirm',
    'deleteImageConfirm',
    'deleteLibraryConfirm',
    'deleteScheduledConfirm',
    'deleteProjectConfirm',
  ];

  if (!confirmedModalTypes.includes(activeModal)) {
    return null;
  }

  const handleConfirm = () => {
    switch (activeModal) {
      case 'clearConfirm':
        clearAllChats();
        break;
      case 'deleteConfirm':
        if (modalData?.id) deleteChat(modalData.id);
        break;
      case 'deleteImageConfirm':
        if (modalData?.id) deleteImage(modalData.id);
        break;
      case 'deleteLibraryConfirm':
        if (modalData?.id) deleteLibraryItem(modalData.id);
        break;
      case 'deleteScheduledConfirm':
        if (modalData?.id) deleteScheduledItem(modalData.id);
        break;
      case 'deleteProjectConfirm':
        if (modalData?.id) deleteProject(modalData.id);
        break;
      default:
        break;
    }
    closeModal();
  };

  const getModalConfig = () => {
    switch (activeModal) {
      case 'clearConfirm':
        return {
          title: 'Clear All Conversations?',
          description:
            'This will permanently remove all conversations and message histories from local storage. This action cannot be undone.',
          confirmText: 'Yes, clear all',
        };
      case 'deleteConfirm':
        return {
          title: 'Delete Conversation?',
          description: (
            <>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                "{modalData?.title || 'this conversation'}"
              </span>
              ? This action cannot be undone.
            </>
          ),
          confirmText: 'Delete Conversation',
        };
      case 'deleteImageConfirm':
        return {
          title: 'Delete Image?',
          description: (
            <>
              Are you sure you want to remove image{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                "{modalData?.name || 'this image'}"
              </span>{' '}
              from your library?
            </>
          ),
          confirmText: 'Delete Image',
        };
      case 'deleteLibraryConfirm':
        return {
          title: 'Delete Saved Note?',
          description: (
            <>
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                "{modalData?.title || 'this note'}"
              </span>{' '}
              from your library?
            </>
          ),
          confirmText: 'Delete Note',
        };
      case 'deleteScheduledConfirm':
        return {
          title: 'Delete Scheduled Reminder?',
          description: (
            <>
              Are you sure you want to remove reminder{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                "{modalData?.title || 'this task'}"
              </span>
              ?
            </>
          ),
          confirmText: 'Delete Reminder',
        };
      case 'deleteProjectConfirm':
        return {
          title: 'Delete Project Workspace?',
          description: (
            <>
              Are you sure you want to delete project{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                "{modalData?.name || 'this project'}"
              </span>
              ? All conversations inside this project will be preserved and unlinked.
            </>
          ),
          confirmText: 'Delete Project',
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#293247] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div className="flex items-center gap-2.5 text-rose-500">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="font-bold text-base text-[#111827] dark:text-[#F3F4F6]">
              {config.title}
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>{config.description}</p>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{config.confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

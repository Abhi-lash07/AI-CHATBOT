import React, { useEffect, useState } from 'react';
import { MessageSquareText, Star, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { RatingStars } from '../ui/RatingStars';

const categories = [
  'Incorrect answer',
  'Incomplete information',
  'Difficult to understand',
  'Irrelevant response',
  'Slow response',
  'Other',
];

export function FeedbackModal() {
  const {
    activeModal,
    modalData,
    closeModal,
    saveResponseFeedback,
    submitOverallRating,
    showToast,
  } = useChat();
  const [rating, setRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isResponseFeedback = activeModal === 'responseFeedback';
  const isOverallRating = activeModal === 'overallRating';
  const isOpen = isResponseFeedback || isOverallRating;

  useEffect(() => {
    if (!isOpen) return;
    const existing = isResponseFeedback ? modalData?.feedback : null;
    setRating(existing?.starRating || 0);
    setSelectedCategories(existing?.categories || []);
    setComment(existing?.comment || '');
  }, [isOpen, isResponseFeedback, modalData]);

  if (!isOpen) return null;

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!rating) {
      showToast('Please select a star rating before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isResponseFeedback) {
        await saveResponseFeedback({
          conversationId: modalData.conversationId,
          responseId: modalData.responseId,
          responseContent: modalData.responseContent,
          thumbsRating: modalData.thumbsRating ?? modalData.feedback?.thumbsRating ?? null,
          starRating: rating,
          categories: selectedCategories,
          comment: comment.trim(),
        });
        showToast('Thank you! Your feedback helps us improve ChatBot AI.', 'success');
      } else {
        await submitOverallRating({ starRating: rating, comment: comment.trim() });
      }
      closeModal();
    } catch (error) {
      showToast(`Feedback could not be submitted: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-fade-in sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-2xl animate-slide-up dark:border-[#293247] dark:bg-[#111827]"
      >
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 dark:border-[#293247] sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1] dark:bg-[#1E293B] dark:text-[#A5B4FC]">
              {isOverallRating ? <Star className="h-4 w-4" /> : <MessageSquareText className="h-4 w-4" />}
            </div>
            <div>
              <h2 id="feedback-title" className="font-bold text-[#111827] dark:text-[#F3F4F6]">
                {isOverallRating ? 'Rate ChatBot AI' : 'Share Your Feedback'}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                {isOverallRating ? 'Your experience helps us get better.' : 'Help us make this response more useful.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close feedback dialog"
            className="rounded-xl p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#1E293B] dark:hover:text-[#F3F4F6]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-5 px-5 py-5 sm:px-6">
            {isOverallRating && (
              <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F3F4F6]">
                How would you rate your experience?
              </h3>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">
                {isOverallRating ? 'Your rating' : 'How did we do?'}
              </p>
              <RatingStars value={rating} onChange={setRating} />
            </div>

            {isResponseFeedback && (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">
                  What could be improved?
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#334155] transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#293247] dark:text-[#D1D5DB] dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/20"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 accent-[#6366F1]"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">
                {isOverallRating ? 'Additional suggestions' : 'Anything else?'} <span className="font-normal text-[#64748B]">(optional)</span>
              </span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Tell us how we can improve..."
                className="w-full resize-y rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#818CF8] focus:ring-2 focus:ring-[#818CF8]/20 dark:border-[#293247] dark:bg-[#0B1020] dark:text-[#F3F4F6] dark:placeholder:text-[#64748B]"
              />
            </label>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-[#E2E8F0] bg-[#F8FAFC]/70 px-5 py-4 dark:border-[#293247] dark:bg-[#0B1020]/30 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-white dark:border-[#293247] dark:text-[#D1D5DB] dark:hover:bg-[#151C2C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rating || submitting}
              className="rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

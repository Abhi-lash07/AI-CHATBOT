import React, { useState } from 'react';
import { Star } from 'lucide-react';

const ratingLabels = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

export function RatingStars({ value, onChange, label = 'Rate your experience' }) {
  const [hovered, setHovered] = useState(0);
  const activeRating = hovered || value;

  return (
    <div>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {ratingLabels.map((ratingLabel, index) => {
          const rating = index + 1;
          const active = rating <= activeRating;
          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={value === rating}
              aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'} — ${ratingLabel}`}
              title={`${rating} — ${ratingLabel}`}
              onMouseEnter={() => setHovered(rating)}
              onMouseLeave={() => setHovered(0)}
              onFocus={() => setHovered(rating)}
              onBlur={() => setHovered(0)}
              onClick={() => onChange(rating)}
              className="rounded-lg p-1 text-amber-400 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8]"
            >
              <Star className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${active ? 'fill-current' : 'fill-transparent'}`} />
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-5 text-sm text-[#64748B] dark:text-[#9CA3AF]" aria-live="polite">
        {activeRating ? (
          <>
            <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{activeRating} / 5</span>
            <span className="mx-1.5">·</span>
            {ratingLabels[activeRating - 1]}
          </>
        ) : (
          'Select a rating'
        )}
      </p>
    </div>
  );
}

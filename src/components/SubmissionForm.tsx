'use client';

import { useState } from 'react';
import Select from 'react-select';
import { countryOptions } from '@/lib/countries';
import { generateSessionId } from '@/lib/supabase';
import { analytics } from '@/lib/analytics';
import { CountryOption, StatsResponse } from '@/types';

interface SubmissionFormProps {
  onSubmitSuccess: (stats: StatsResponse) => void;
}

export default function SubmissionForm({ onSubmitSuccess }: SubmissionFormProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCountryChange = (option: CountryOption | null) => {
    setSelectedCountry(option);
    if (option) {
      analytics.countrySelected(option.country.code, option.country.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCountry) {
      setError('Please select your country');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    analytics.submitClicked(selectedCountry.country.code, selectedCountry.country.name);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: selectedCountry.country.code,
          country_name: selectedCountry.country.name,
          display_name: displayName.trim() || null,
          session_id: generateSessionId(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit');
      }

      analytics.submissionSuccess(selectedCountry.country.code);
      setSuccess(true);

      if (data.stats) {
        onSubmitSuccess(data.stats);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      analytics.submissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">{selectedCountry?.country.flag}</div>
        <p className="text-white text-lg font-medium">Thanks for submitting!</p>
        <p className="text-white/70 mt-2">
          You&apos;ve been counted as part of {selectedCountry?.country.name}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="country" className="block text-white text-sm font-medium mb-2">
          Where are you from? *
        </label>
        <Select
          id="country"
          options={countryOptions}
          value={selectedCountry}
          onChange={handleCountryChange}
          placeholder="Search for your country..."
          isSearchable
          classNames={{
            control: () =>
              '!bg-white/10 !border-white/20 !rounded-lg hover:!border-white/40',
            input: () => '!text-white',
            singleValue: () => '!text-white',
            placeholder: () => '!text-white/50',
            menu: () => '!bg-gray-900 !border !border-white/20 !rounded-lg',
            option: ({ isFocused, isSelected }) =>
              `!cursor-pointer ${isSelected ? '!bg-purple-600' : isFocused ? '!bg-white/20' : '!bg-transparent'} !text-white`,
          }}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '44px',
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: '200px',
            }),
          }}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
          Display Name (optional)
        </label>
        <input
          type="text"
          id="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.slice(0, 24))}
          placeholder="Your Discord name..."
          maxLength={24}
          className="
            w-full px-4 py-3 rounded-lg
            bg-white/10 border border-white/20
            text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all
          "
        />
        <p className="text-white/50 text-xs mt-1">{displayName.length}/24 characters</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedCountry}
        className="
          w-full py-3 px-6 rounded-lg
          bg-gradient-to-r from-purple-600 to-indigo-600
          hover:from-purple-500 hover:to-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          text-white font-medium
          transition-all transform hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent
        "
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit'
        )}
      </button>
    </form>
  );
}

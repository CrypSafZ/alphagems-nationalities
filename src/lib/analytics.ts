import posthog from 'posthog-js';

export function initAnalytics() {
  // Initialize PostHog
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      persistence: 'memory', // Cookie-less mode for GDPR compliance
    });
  }
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  // PostHog tracking
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }

  // GA4 tracking
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', eventName, properties);
  }
}

// Predefined events
export const analytics = {
  submitClicked: (countryCode: string, countryName: string) => {
    trackEvent('submit_clicked', { country_code: countryCode, country_name: countryName });
  },
  countrySelected: (countryCode: string, countryName: string) => {
    trackEvent('country_selected', { country_code: countryCode, country_name: countryName });
  },
  chartToggled: (chartType: 'bar' | 'pie') => {
    trackEvent('chart_toggled', { chart_type: chartType });
  },
  submissionSuccess: (countryCode: string) => {
    trackEvent('submission_success', { country_code: countryCode });
  },
  submissionError: (error: string) => {
    trackEvent('submission_error', { error });
  },
};

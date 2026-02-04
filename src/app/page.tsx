'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import GlassCard from '@/components/GlassCard';
import SubmissionForm from '@/components/SubmissionForm';
import BarChartViz from '@/components/BarChartViz';
import PieChartViz from '@/components/PieChartViz';
import ChartToggle from '@/components/ChartToggle';
import { supabase } from '@/lib/supabase';
import { initAnalytics } from '@/lib/analytics';
import { ChartType, CountryCount, StatsResponse } from '@/types';

// Dynamic import for WorldMap (requires client-side only)
const WorldMap = dynamic(() => import('@/components/WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px] md:h-[400px]">
      <div className="animate-spin h-8 w-8 border-4 border-white/20 border-t-white rounded-full" />
    </div>
  ),
});

export default function Home() {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [stats, setStats] = useState<CountryCount[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.countries);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialize analytics
    initAnalytics();

    // Fetch initial stats
    fetchStats();

    // Set up realtime subscription
    const channel = supabase
      .channel('submissions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
        },
        () => {
          // Refetch stats when new submission is added
          fetchStats();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  const handleSubmitSuccess = (newStats: StatsResponse) => {
    setStats(newStats.countries);
    setTotal(newStats.total);
  };

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url(/background.jpg)' }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <Image
            src="/logo.png"
            alt="Alphagems Logo"
            width={120}
            height={120}
            className="mb-4"
            priority
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            Alphagems Nationalities
          </h1>
        </div>

        {/* World Map Card */}
        <div className="w-full max-w-6xl mb-6">
          <GlassCard className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Global Community Map
            </h2>
            <WorldMap data={stats} />
          </GlassCard>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submission Form Card */}
          <GlassCard className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">
              Add Your Nationality
            </h2>
            <SubmissionForm onSubmitSuccess={handleSubmitSuccess} />
          </GlassCard>

          {/* Chart Card */}
          <GlassCard className="p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Community Distribution
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  {isLoading ? 'Loading...' : `${total} total submissions`}
                </p>
              </div>
              <ChartToggle chartType={chartType} onToggle={setChartType} />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-white/20 border-t-white rounded-full" />
              </div>
            ) : chartType === 'bar' ? (
              <BarChartViz data={stats} />
            ) : (
              <PieChartViz data={stats} />
            )}
          </GlassCard>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-white/50 text-sm text-center">
          <p>Made with love by the Alphagems Community</p>
        </footer>
      </div>
    </main>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  Database,
  ExternalLink,
} from 'lucide-react';
import { SyncLog } from '@/types';

export default function AdminSyncPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isProduction, setIsProduction] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if running on production domain
    if (
      typeof window !== 'undefined' &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    ) {
      setIsProduction(true);
    }
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startSync = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'info',
        message: 'Establishing stream connection to POST /api/sync...',
      },
    ]);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });

      if (response.status === 403) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type: 'error',
            message: '403 Forbidden: Sync API is locked in production environments.',
          },
        ]);
        setIsRunning(false);
        return;
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            setLogs((prev) => [...prev, parsed]);
          } catch {
            setLogs((prev) => [
              ...prev,
              {
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                type: 'info',
                message: line,
              },
            ]);
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          setLogs((prev) => [...prev, parsed]);
        } catch {
          setLogs((prev) => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
              type: 'info',
              message: buffer,
            },
          ]);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'error',
          message: `Network/Sync connection failed: ${msg}`,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.source ? `[${l.source}] ` : ''}${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isProduction) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-red-900/50 rounded-xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-red-400">403 Forbidden</h1>
          <p className="text-zinc-400 text-sm">
            Local Development Only. Scraping and syncing execution routes are permanently disabled on production domains to ensure zero data exfiltration.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to DevPulse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Sync Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Terminal className="w-7 h-7 text-emerald-400" />
              DevPulse Scraper Console
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Local trigger to scrape active Devfolio hackathons, Unstop challenges, and 25+ company ATS boards into Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Live Platform
            </Link>
            <button
              onClick={startSync}
              disabled={isRunning}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-xs font-mono transition-all shadow-lg ${
                isRunning
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 hover:shadow-emerald-500/20 active:scale-95'
              }`}
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
              {isRunning ? 'SYNCHRONIZING...' : 'START SCRAPING & SYNC'}
            </button>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3 text-zinc-300">
            <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-zinc-400">Target Database:</span> Supabase PostgreSQL
              <div className="text-zinc-500 text-[11px]">
                Opportunities: <span className="text-emerald-400 font-bold">opportunities</span> • Hackathons:{' '}
                <span className="text-emerald-400 font-bold">hackathons</span>
              </div>
            </div>
          </div>
          <div className="text-zinc-400 text-right">
            <span>Environment: </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Development (Local Only)
            </span>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Terminal Title Bar */}
          <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-xs font-mono text-zinc-400">terminal@devpulse-sync: ~</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyLogs}
                disabled={logs.length === 0}
                className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors disabled:opacity-40 flex items-center gap-1"
                title="Copy logs to clipboard"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={clearLogs}
                disabled={logs.length === 0}
                className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors disabled:opacity-40 flex items-center gap-1"
                title="Clear console"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Terminal Logs Output */}
          <div className="p-4 md:p-6 font-mono text-xs md:text-sm h-[480px] overflow-y-auto space-y-2 bg-black/50">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-3">
                <Terminal className="w-10 h-10 stroke-[1.5]" />
                <p>Scraper console ready. Click &quot;START SCRAPING &amp; SYNC&quot; to fetch latest opportunities.</p>
              </div>
            ) : (
              logs.map((log, index) => {
                let badgeColor = 'text-zinc-400';
                let Icon = Info;
                if (log.type === 'success') {
                  badgeColor = 'text-emerald-400';
                  Icon = CheckCircle2;
                } else if (log.type === 'warn') {
                  badgeColor = 'text-yellow-400';
                  Icon = AlertTriangle;
                } else if (log.type === 'error') {
                  badgeColor = 'text-red-400';
                  Icon = XCircle;
                }

                return (
                  <div key={index} className="flex items-start gap-2.5 leading-relaxed hover:bg-zinc-900/40 py-0.5 px-1 rounded transition-colors">
                    <span className="text-zinc-600 shrink-0 text-xs select-none">[{log.timestamp}]</span>
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${badgeColor}`} />
                    {log.source && (
                      <span className="text-violet-400 font-semibold shrink-0 select-none">
                        [{log.source}]
                      </span>
                    )}
                    <span className={badgeColor}>{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Footer Info */}
          <div className="bg-zinc-900/60 px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <div>Lines: {logs.length}</div>
            <div>Status: {isRunning ? <span className="text-emerald-400">Syncing active stream...</span> : 'Idle'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

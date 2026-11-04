'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { DeveloperBanner } from '@/components/DeveloperBanner';
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
      <div className="min-h-screen bg-[#ffffff] text-[#262626] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#f7f7f7] border border-[#e6e6e6] p-8 text-center space-y-4 rounded-none">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-300">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#262626]">403 Forbidden</h1>
          <p className="text-[#6b6b6b] text-sm font-light">
            Local Development Only. Scraping and syncing execution routes are permanently disabled on production domains.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c69d4] hover:bg-[#0653b6] text-white text-xs font-bold uppercase tracking-[1px] transition-colors rounded-none"
          >
            <ArrowLeft className="w-4 h-4" /> RETURN TO LIVE PLATFORM
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#262626] font-sans selection:bg-[#1c69d4]/20 selection:text-[#1c69d4]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#e6e6e6] py-3.5 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1c69d4] text-white flex items-center justify-center font-bold text-xs">
            DP
          </div>
          <span className="font-bold text-base text-[#262626] uppercase">DevPulse Engine</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#cccccc] hover:border-[#262626] text-[#262626] text-xs font-bold uppercase tracking-[0.5px] rounded-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> LIVE PLATFORM ›
        </Link>
      </header>

      {/* Developer Banner */}
      <DeveloperBanner />

      {/* Admin Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e6e6e6] pb-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#1c69d4] mb-1">
              LOCAL CONSOLE &amp; SCRAPER ENGINE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#262626] flex items-center gap-3">
              <Terminal className="w-7 h-7 text-[#1c69d4]" />
              Database Synchronizer
            </h1>
            <p className="text-sm text-[#6b6b6b] font-light mt-1">
              Fetch 600+ active hackathons and 500+ tech roles across Devfolio, Devpost, Unstop, and ATS boards and upsert directly into Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startSync}
              disabled={isRunning}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-none font-bold text-xs uppercase tracking-[1px] transition-colors shadow-sm ${
                isRunning
                  ? 'bg-[#ebebeb] text-[#9a9a9a] cursor-not-allowed border border-[#cccccc]'
                  : 'bg-[#1c69d4] hover:bg-[#0653b6] text-white active:translate-y-px'
              }`}
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
              {isRunning ? 'SYNCHRONIZING...' : 'START SCRAPING & SYNC ›'}
            </button>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="bg-[#f7f7f7] border border-[#e6e6e6] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono rounded-none">
          <div className="flex items-center gap-3 text-[#262626]">
            <div className="p-2 bg-[#1c69d4]/10 text-[#1c69d4]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#6b6b6b]">Target Supabase Cloud: </span>
              <strong className="text-[#262626]">gtalukwyjonqedivluou.supabase.co</strong>
              <div className="text-[#9a9a9a] text-[11px]">
                Tables: <span className="text-[#1c69d4] font-bold">opportunities</span> •{' '}
                <span className="text-[#1c69d4] font-bold">hackathons</span>
              </div>
            </div>
          </div>
          <div className="text-[#6b6b6b] text-right">
            <span>Mode: </span>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 font-bold border border-green-300">
              Local Development Verified
            </span>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-[#1a2129] border border-[#262e38] rounded-none overflow-hidden shadow-xl text-white">
          {/* Bar */}
          <div className="bg-[#262e38] px-4 py-3 border-b border-[#374151] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#bbbbbb]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
              <span>console@devpulse-sync: ~</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyLogs}
                disabled={logs.length === 0}
                className="px-2.5 py-1 text-xs text-[#bbbbbb] hover:text-white hover:bg-[#374151] rounded-none transition-colors disabled:opacity-40 flex items-center gap-1 font-mono"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={clearLogs}
                disabled={logs.length === 0}
                className="px-2.5 py-1 text-xs text-[#bbbbbb] hover:text-white hover:bg-[#374151] rounded-none transition-colors disabled:opacity-40 flex items-center gap-1 font-mono"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm h-[440px] overflow-y-auto space-y-2 bg-[#141a20]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6b7280] space-y-2">
                <Terminal className="w-8 h-8 stroke-[1.5]" />
                <p>Ready to synchronize. Click &quot;START SCRAPING &amp; SYNC&quot; to fetch live data.</p>
              </div>
            ) : (
              logs.map((log, index) => {
                let badgeColor = 'text-[#bbbbbb]';
                let Icon = Info;
                if (log.type === 'success') {
                  badgeColor = 'text-green-400';
                  Icon = CheckCircle2;
                } else if (log.type === 'warn') {
                  badgeColor = 'text-yellow-400';
                  Icon = AlertTriangle;
                } else if (log.type === 'error') {
                  badgeColor = 'text-red-400';
                  Icon = XCircle;
                }

                return (
                  <div key={index} className="flex items-start gap-2.5 py-0.5 px-1 leading-relaxed">
                    <span className="text-[#6b7280] shrink-0 text-xs select-none">[{log.timestamp}]</span>
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${badgeColor}`} />
                    {log.source && (
                      <span className="text-[#1c69d4] font-semibold shrink-0 select-none">
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

          <div className="bg-[#262e38] px-4 py-2 border-t border-[#374151] flex items-center justify-between text-[11px] font-mono text-[#9a9a9a]">
            <div>Records logged: {logs.length}</div>
            <div>{isRunning ? <span className="text-green-400">Stream in progress...</span> : 'Status: Idle'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

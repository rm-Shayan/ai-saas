"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface StartupResearch {
  startupName?: string;
  tagline?: string;
  description?: string;
  problem?: string;
  solution?: string;
  marketSize?: {
    tam?: number | string;
    sam?: number | string;
    som?: number | string;
  };
  metrics?: Array<{ label: string; value: string | number }>;
  competitors?: string[];
  swot?: {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  unitEconomics?: Array<{ metric: string; value: string | number }>;
  risks?: string[];
  redFlags?: string[];
  fundingAsk?: string;
  useOfFunds?: string[];
  valuation?: string;
  traction?: string[];
  revenue?: string;
  runway?: string;
  team?: string[];
  verdict?: {
    score?: number | string;
    status?: string;
    reasoning?: string;
  };
  charts?: Array<{
    title: string;
    labels: string[];
    data: number[];
    type?: string;
  }>;
  sources?: string[];
}

interface Props {
  research: StartupResearch | null;
  onExpressInterest?: () => void;
}

export default function StartupOnePager({ research, onExpressInterest }: Props) {
  if (!research) return null;

  const score = typeof research.verdict?.score === "number" ? research.verdict.score : Number(research.verdict?.score) || 0;
  const status = research.verdict?.status || "N/A";
  const getStatusColor = (s: string) => {
    const v = s.toLowerCase();
    if (v.includes("strong") || v.includes("positive") || v.includes("go")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (v.includes("moderate")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (v.includes("weak") || v.includes("no-go")) return "bg-red-100 text-red-800 border-red-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{research.startupName || "Startup Analysis"}</h1>
            {research.tagline && <p className="mt-1 text-lg text-muted-foreground">{research.tagline}</p>}
            {research.description && <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">{research.description}</p>}
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            {research.verdict && (
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(status))}>
                Verdict: {status} ({score}/100)
              </span>
            )}
            {research.fundingAsk && <span className="text-sm text-muted-foreground">Funding Ask: {research.fundingAsk}</span>}
            {research.valuation && <span className="text-sm text-muted-foreground">Valuation: {research.valuation}</span>}
            {research.runway && <span className="text-sm text-muted-foreground">Runway: {research.runway}</span>}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onExpressInterest}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            I'm Interested in Funding This Startup
          </button>
        </div>
      </div>

      {/* Problem/Solution */}
      {(research.problem || research.solution) && (
        <div className="grid md:grid-cols-2 gap-4">
          {research.problem && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">Problem</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{research.problem}</p>
            </div>
          )}
          {research.solution && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">Solution</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{research.solution}</p>
            </div>
          )}
        </div>
      )}

      {/* Market Size */}
      {research.marketSize && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Market Size</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {research.marketSize.tam && (
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">TAM</p>
                <p className="text-lg font-semibold">{research.marketSize.tam}</p>
              </div>
            )}
            {research.marketSize.sam && (
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">SAM</p>
                <p className="text-lg font-semibold">{research.marketSize.sam}</p>
              </div>
            )}
            {research.marketSize.som && (
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">SOM</p>
                <p className="text-lg font-semibold">{research.marketSize.som}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics */}
      {research.metrics && research.metrics.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Key Metrics</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {research.metrics.map((m, i) => (
              <div key={i} className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit Economics */}
      {research.unitEconomics && research.unitEconomics.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Unit Economics</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {research.unitEconomics.map((u, i) => (
              <div key={i} className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">{u.metric}</p>
                <p className="text-lg font-semibold">{u.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SWOT */}
      {research.swot && (
        <div className="grid md:grid-cols-2 gap-4">
          {research.swot.strengths && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">Strengths</h2>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {research.swot.strengths.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
          {research.swot.weaknesses && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">Weaknesses</h2>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {research.swot.weaknesses.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
          {research.swot.opportunities && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">Opportunities</h2>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {research.swot.opportunities.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
          {research.swot.threats && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">Threats</h2>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {research.swot.threats.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Risks & Red Flags */}
      <div className="grid md:grid-cols-2 gap-4">
        {research.risks && research.risks.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold">Key Risks</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {research.risks.map((r, i) => (<li key={i}>{r}</li>))}
            </ul>
          </div>
        )}
        {research.redFlags && research.redFlags.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-red-600">Red Flags</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-red-600">
              {research.redFlags.map((r, i) => (<li key={i}>{r}</li>))}
            </ul>
          </div>
        )}
      </div>

      {/* Competitors */}
      {research.competitors && research.competitors.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Competitors</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {research.competitors.map((c, i) => (
              <span key={i} className="inline-flex px-2.5 py-1 rounded-full text-xs bg-muted text-muted-foreground border border-border">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Use of Funds & Traction */}
      <div className="grid md:grid-cols-2 gap-4">
        {research.useOfFunds && research.useOfFunds.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold">Use of Funds</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {research.useOfFunds.map((u, i) => (<li key={i}>{u}</li>))}
            </ul>
          </div>
        )}
        {research.traction && research.traction.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold">Traction</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {research.traction.map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          </div>
        )}
      </div>

      {/* Team & Sources */}
      <div className="grid md:grid-cols-2 gap-4">
        {research.team && research.team.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold">Team</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {research.team.map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          </div>
        )}
        {research.sources && research.sources.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold">Sources</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {research.sources.map((s, i) => (<li key={i}>{s}</li>))}
            </ul>
          </div>
        )}
      </div>

      {/* Verdict Reasoning */}
      {research.verdict?.reasoning && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Investment Thesis</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{research.verdict.reasoning}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onExpressInterest}
          className="inline-flex items-center px-6 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm"
        >
          Express Funding Interest
        </button>
      </div>
    </div>
  );
}

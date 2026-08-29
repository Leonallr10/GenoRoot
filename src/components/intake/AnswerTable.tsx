"use client";

import type { AnswerTableRow } from "@/lib/engine/answer-table";
import { groupRowsBySection } from "@/lib/engine/answer-table";

interface AnswerTableProps {
  rows: AnswerTableRow[];
  valueHeader?: string;
}

export function AnswerTable({ rows, valueHeader = "Answer" }: AnswerTableProps) {
  const sections = groupRowsBySection(rows);

  if (rows.length === 0) {
    return (
      <p className="text-center text-lg text-slate-600">No answers recorded.</p>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.sectionId}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#d4845c] sm:text-base">
            Section {section.sectionId} — {section.sectionTitle}
          </h3>
          <div className="genoroot-glass overflow-hidden rounded-2xl">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/60 bg-white/30">
                  <th className="px-4 py-3 text-sm font-semibold text-[#c96f35] sm:px-5 sm:text-base">
                    Question
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#c96f35] sm:px-5 sm:text-base">
                    {valueHeader}
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr
                    key={`${row.sectionId}-${row.label}-${i}`}
                    className="border-b border-white/40 last:border-0"
                  >
                    <td className="px-4 py-4 text-base text-slate-600 sm:px-5 sm:text-lg">
                      {row.label}
                    </td>
                    <td className="px-4 py-4 text-base font-bold text-slate-900 sm:px-5 sm:text-xl">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TranscriptTableProps {
  rows: { label: string; original: string; english: string }[];
}

export function TranscriptTable({ rows }: TranscriptTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
        Free-form responses
      </h3>
      <div className="genoroot-glass overflow-hidden rounded-2xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/60 bg-white/30">
              <th className="px-4 py-3 text-sm font-semibold text-[#c96f35] sm:px-5">
                Field
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[#c96f35] sm:px-5">
                Original
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[#c96f35] sm:px-5">
                English
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-white/40 last:border-0">
                <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">{row.label}</td>
                <td className="px-4 py-4 text-base text-slate-800 sm:px-5">{row.original}</td>
                <td className="px-4 py-4 text-base font-semibold text-slate-900 sm:px-5">
                  {row.english}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

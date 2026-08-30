import { REPORT_SECTIONS, type ClinicalReport } from "@/lib/report/schema";

interface ReportViewProps {
  report: ClinicalReport;
  model?: string;
  generatedAt?: string;
}

function SectionBody({ value }: { value: string | string[] }) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-base text-slate-600">None noted.</p>;
    }
    return (
      <ul className="list-disc space-y-2 pl-5 text-base text-slate-800 sm:text-lg">
        {value.map((item, index) => (
          <li key={`${item.slice(0, 24)}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-800 sm:text-lg">
      {value}
    </p>
  );
}

export function ReportView({ report, model, generatedAt }: ReportViewProps) {
  return (
    <article className="space-y-5">
      <header className="genoroot-glass rounded-2xl px-5 py-4">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {report.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Intake summary for clinical discussion — not a diagnosis.
          {generatedAt ? ` · ${new Date(generatedAt).toLocaleString()}` : ""}
          {model ? ` · ${model}` : ""}
        </p>
      </header>

      {REPORT_SECTIONS.map((section) => (
        <section key={section.key} className="genoroot-glass rounded-2xl px-5 py-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#d4845c] sm:text-base">
            {section.label}
          </h3>
          <SectionBody value={report[section.key]} />
        </section>
      ))}
    </article>
  );
}

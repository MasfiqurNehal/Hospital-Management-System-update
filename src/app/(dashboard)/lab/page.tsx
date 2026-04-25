'use client';

import { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { labAPI } from '@/lib/mock-api';
import { useAuthStore } from '@/lib/auth-store';
import { formatDateTime, formatRelative, cn } from '@/lib/utils';
import type { LabTest, LabResultFlag, LabTestStatus } from '@/types';

export default function LabDashboardPage() {
  const { user } = useAuthStore();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [selected, setSelected] = useState<LabTest | null>(null);

  useEffect(() => {
    labAPI.list().then((r) => {
      setTests(r.data);
      const pending = r.data.filter((t) => ['ordered', 'sample_collected', 'in_progress'].includes(t.status));
      if (pending.length > 0) setSelected(pending[0]);
      else if (r.data.length > 0) setSelected(r.data[0]);
    });
  }, []);

  const pending = tests.filter((t) => t.status === 'ordered' || t.status === 'sample_collected').length;
  const inProgress = tests.filter((t) => t.status === 'in_progress').length;
  const reportedToday = tests.filter((t) => {
    if (!t.reported_at) return false;
    return new Date(t.reported_at).toDateString() === new Date().toDateString();
  }).length;
  const critical = tests.filter((t) => t.overall_flag === 'critical').length;

  function flagVariant(flag: LabResultFlag) {
    switch (flag) {
      case 'critical': return 'critical';
      case 'borderline': return 'borderline';
      case 'abnormal_high':
      case 'abnormal_low': return 'warning';
      default: return 'healthy';
    }
  }

  function statusVariant(status: LabTestStatus) {
    switch (status) {
      case 'reported': return 'healthy';
      case 'in_progress': case 'result_entered': return 'accent';
      case 'sample_collected': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.full_name ?? 'Lab Tech'}`}
        description={
          user?.lab_tech_profile
            ? `Specializations: ${user.lab_tech_profile.specializations.join(', ')}`
            : 'Lab technician workspace'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Pending Tests" value={pending} icon={FlaskConical} accentColor="borderline" />
        <KPICard label="In Progress" value={inProgress} icon={FlaskConical} accentColor="accent" />
        <KPICard label="Reported Today" value={reportedToday} icon={FlaskConical} accentColor="healthy" />
        <KPICard label="Critical Results" value={critical} icon={FlaskConical} accentColor="critical" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Test Queue" description="Pending and in-progress" className="lg:col-span-1">
          {tests.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={FlaskConical} title="No tests" description="No tests in the queue." />
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[520px] overflow-y-auto scrollbar-slim">
              {tests.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={cn(
                    'cursor-pointer px-4 py-3 hover:bg-secondary/30 transition-colors',
                    selected?.id === t.id && 'bg-secondary/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{t.test_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.patient_name}</div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={flagVariant(t.overall_flag)} className="text-[10px]">{t.overall_flag}</Badge>
                      <Badge variant={statusVariant(t.status)} className="text-[10px]">{t.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <code>{t.test_number}</code>
                    <span>·</span>
                    <span className="capitalize">{t.priority}</span>
                    <span>·</span>
                    <span>{formatRelative(t.ordered_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Test Details" className="lg:col-span-2">
          {!selected ? (
            <div className="p-6">
              <EmptyState icon={FlaskConical} title="Select a test" description="Click a test on the left." />
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{selected.test_name}</h3>
                    <Badge variant={flagVariant(selected.overall_flag)}>{selected.overall_flag}</Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">{selected.test_number}</code>
                </div>
                <Badge variant={statusVariant(selected.status)} className="capitalize shrink-0">
                  {selected.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow label="Patient" value={`${selected.patient_name} (${selected.patient_mrn})`} />
                <InfoRow label="Age / Gender" value={`${selected.patient_age}y · ${selected.patient_gender}`} />
                <InfoRow label="Ordered by" value={selected.ordered_by_doctor_name} />
                <InfoRow label="Category" value={selected.category} />
                <InfoRow label="Priority" value={selected.priority} />
                <InfoRow label="Ordered at" value={formatDateTime(selected.ordered_at)} />
                {selected.sample_collected_at && (
                  <InfoRow label="Sample collected" value={formatDateTime(selected.sample_collected_at)} />
                )}
              </div>

              {selected.results && selected.results.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Results</div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b border-border">
                        <th className="pb-2 font-medium">Parameter</th>
                        <th className="pb-2 font-medium text-right">Value</th>
                        <th className="pb-2 font-medium text-right">Reference</th>
                        <th className="pb-2 font-medium text-right">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {selected.results.map((r) => (
                        <tr key={r.parameter_id}>
                          <td className="py-2 font-medium">{r.parameter_name}</td>
                          <td className="py-2 text-right tabular-nums font-semibold">{r.value} {r.unit}</td>
                          <td className="py-2 text-right text-xs text-muted-foreground tabular-nums">
                            {r.reference_range_display} {r.unit}
                          </td>
                          <td className="py-2 text-right">
                            <Badge variant={flagVariant(r.flag)} className="text-[10px]">{r.flag}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selected.clinical_notes && (
                <div className="rounded-lg bg-secondary/30 px-4 py-3 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Clinical Notes</div>
                  <p>{selected.clinical_notes}</p>
                </div>
              )}

              {selected.critical_alert_triggered && (
                <div className="rounded-lg border-2 border-critical/30 bg-critical/5 px-4 py-3 text-sm text-critical">
                  Critical alert dispatched to ordering doctor via HAS
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}

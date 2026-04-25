'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, Search } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, KPICard } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { labAPI } from '@/lib/mock-api';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import type { LabTest, LabTestStatus, LabTestPriority, LabResultFlag } from '@/types';

export default function LabTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | LabTestStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LabTest | null>(null);

  useEffect(() => {
    labAPI.list().then((r) => {
      setTests(r.data);
      if (r.data.length > 0) setSelected(r.data[0]);
    });
  }, []);

  const filtered = tests.filter((t) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      t.patient_name.toLowerCase().includes(q) ||
      t.patient_mrn.toLowerCase().includes(q) ||
      t.test_name.toLowerCase().includes(q) ||
      t.test_number.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const pending = tests.filter((t) => t.status === 'ordered' || t.status === 'sample_collected').length;
  const inProgress = tests.filter((t) => t.status === 'in_progress' || t.status === 'result_entered').length;
  const reported = tests.filter((t) => t.status === 'reported').length;
  const critical = tests.filter((t) => t.overall_flag === 'critical').length;

  const statuses: Array<{ value: 'all' | LabTestStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'sample_collected', label: 'Sample Collected' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'result_entered', label: 'Results Entered' },
    { value: 'reported', label: 'Reported' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

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
      case 'in_progress':
      case 'result_entered': return 'accent';
      case 'sample_collected': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  }

  function priorityVariant(priority: LabTestPriority) {
    switch (priority) {
      case 'stat':
      case 'critical': return 'critical';
      case 'urgent': return 'warning';
      default: return 'secondary';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Tests"
        description="Test orders, results, and critical value alerts"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Pending" value={pending} icon={FlaskConical} accentColor="borderline" />
        <KPICard label="In Progress" value={inProgress} icon={FlaskConical} accentColor="accent" />
        <KPICard label="Reported" value={reported} icon={FlaskConical} accentColor="healthy" />
        <KPICard label="Critical Results" value={critical} icon={FlaskConical} accentColor="critical" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by patient, MRN, test name, or test#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === s.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-secondary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Test Orders"
          description={`${filtered.length} tests`}
          className="lg:col-span-1"
        >
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={FlaskConical} title="No tests found" description="Try adjusting your filter." />
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-slim">
              {filtered.map((t) => (
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
                      <Badge variant={flagVariant(t.overall_flag)} className="text-[10px]">
                        {t.overall_flag}
                      </Badge>
                      <Badge variant={statusVariant(t.status)} className="text-[10px]">
                        {t.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <code>{t.test_number}</code>
                    <span>·</span>
                    <Badge variant={priorityVariant(t.priority)} className="text-[10px]">
                      {t.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Test Details" className="lg:col-span-2">
          {!selected ? (
            <div className="p-6">
              <EmptyState
                icon={FlaskConical}
                title="Select a test"
                description="Click a test on the left to view details."
              />
            </div>
          ) : (
            <div className="p-5 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{selected.test_name}</h3>
                    <Badge variant={flagVariant(selected.overall_flag)}>
                      {selected.overall_flag}
                    </Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">{selected.test_number}</code>
                </div>
                <Badge variant={statusVariant(selected.status)} className="capitalize shrink-0">
                  {selected.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Patient" value={`${selected.patient_name} (${selected.patient_mrn})`} />
                <InfoRow label="Age / Gender" value={`${selected.patient_age}y · ${selected.patient_gender}`} />
                <InfoRow label="Ordered by" value={selected.ordered_by_doctor_name} />
                <InfoRow label="Category" value={selected.category} />
                <InfoRow label="Priority" value={selected.priority} />
                <InfoRow label="Ordered at" value={formatDateTime(selected.ordered_at)} />
                {selected.sample_collected_at && (
                  <InfoRow label="Sample collected" value={formatDateTime(selected.sample_collected_at)} />
                )}
                {selected.reported_at && (
                  <InfoRow label="Reported at" value={formatDateTime(selected.reported_at)} />
                )}
                {selected.entered_by_technician_name && (
                  <InfoRow label="Technician" value={selected.entered_by_technician_name} />
                )}
              </div>

              {selected.results && selected.results.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Results
                  </div>
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
                          <td className="py-2 text-right tabular-nums font-semibold">
                            {r.value} {r.unit}
                          </td>
                          <td className="py-2 text-right text-xs text-muted-foreground tabular-nums">
                            {r.reference_range_display} {r.unit}
                          </td>
                          <td className="py-2 text-right">
                            <Badge variant={flagVariant(r.flag)} className="text-[10px]">
                              {r.flag}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selected.clinical_notes && (
                <div className="rounded-lg bg-borderline/10 px-4 py-3 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Clinical Notes
                  </div>
                  <p>{selected.clinical_notes}</p>
                </div>
              )}

              {selected.critical_alert_triggered && (
                <div className="rounded-lg border-2 border-critical/30 bg-critical/5 px-4 py-3 text-sm text-critical">
                  Critical alert dispatched via HAS
                  {selected.critical_alert_sent_at && (
                    <span className="ml-2 text-xs opacity-70">
                      at {formatDateTime(selected.critical_alert_sent_at)}
                    </span>
                  )}
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

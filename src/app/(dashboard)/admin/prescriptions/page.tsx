'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { prescriptionAPI } from '@/lib/mock-api';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Prescription, PrescriptionStatus } from '@/types';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | PrescriptionStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    prescriptionAPI.list().then((r) => setPrescriptions(r.data));
  }, []);

  const filtered = prescriptions.filter((rx) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      rx.patient_name.toLowerCase().includes(q) ||
      rx.patient_mrn.toLowerCase().includes(q) ||
      rx.doctor_name.toLowerCase().includes(q) ||
      rx.prescription_number.toLowerCase().includes(q) ||
      rx.diagnosis.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || rx.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const statuses: Array<{ value: 'all' | PrescriptionStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'signed', label: 'Signed' },
    { value: 'dispensed_full', label: 'Dispensed' },
    { value: 'dispensed_partial', label: 'Partial' },
    { value: 'draft', label: 'Draft' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  function statusVariant(status: PrescriptionStatus) {
    switch (status) {
      case 'dispensed_full': return 'healthy';
      case 'dispensed_partial': return 'warning';
      case 'signed': return 'accent';
      case 'draft': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        description={`${prescriptions.length} total prescriptions`}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by patient, MRN, doctor, diagnosis, or Rx#..."
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

      <SectionCard
        title="Prescription List"
        description={`Showing ${filtered.length} of ${prescriptions.length}`}
      >
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardList}
              title="No prescriptions found"
              description="Try adjusting your search or filter."
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((rx) => (
              <div key={rx.id}>
                <div
                  className="flex cursor-pointer items-start gap-3 px-5 py-4 hover:bg-secondary/30"
                  onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
                >
                  <Avatar name={rx.patient_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{rx.patient_name}</span>
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">
                        {rx.patient_mrn}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {rx.patient_age}y · {rx.patient_gender}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-foreground">{rx.diagnosis}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <code className="text-[11px]">{rx.prescription_number}</code>
                      <span>{rx.doctor_name}</span>
                      <span>{rx.doctor_specialty}</span>
                      {rx.signed_at && <span>{formatDate(rx.signed_at)}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={statusVariant(rx.status)} className="capitalize">
                      {rx.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {rx.medicines.length} med{rx.medicines.length !== 1 ? 's' : ''}
                    </span>
                    {expandedId === rx.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedId === rx.id && (
                  <div className="border-t border-border bg-secondary/10 px-5 py-4 space-y-4">
                    {rx.vital_signs && (
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Vitals
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {rx.vital_signs.blood_pressure && (
                            <span><span className="text-muted-foreground">BP:</span> {rx.vital_signs.blood_pressure}</span>
                          )}
                          {rx.vital_signs.pulse && (
                            <span><span className="text-muted-foreground">Pulse:</span> {rx.vital_signs.pulse} bpm</span>
                          )}
                          {rx.vital_signs.temperature && (
                            <span><span className="text-muted-foreground">Temp:</span> {rx.vital_signs.temperature}°F</span>
                          )}
                          {rx.vital_signs.weight_kg && (
                            <span><span className="text-muted-foreground">Weight:</span> {rx.vital_signs.weight_kg} kg</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Prescribed Medicines
                      </div>
                      <div className="space-y-2">
                        {rx.medicines.map((med, i) => (
                          <div key={i} className="rounded-lg border border-border bg-card px-4 py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-medium">{med.brand_name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({med.generic_name} {med.strength})
                                </span>
                              </div>
                              <Badge variant="outline" className="shrink-0 text-[10px]">
                                {med.route}
                              </Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {med.dosage} · {med.frequency.replace(/_/g, ' ')} · {med.duration_days} days · Qty: {med.quantity}
                            </div>
                            {med.special_instructions && (
                              <div className="mt-1 text-xs italic text-muted-foreground">
                                {med.special_instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {rx.advice && (
                      <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Advice
                        </div>
                        <p className="text-sm text-foreground">{rx.advice}</p>
                      </div>
                    )}

                    {rx.follow_up_date && (
                      <div className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
                        Follow-up scheduled: {formatDateTime(rx.follow_up_date)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

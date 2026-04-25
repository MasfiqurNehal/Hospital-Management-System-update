'use client';

import { useEffect, useState } from 'react';
import { Activity, Calendar } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { appointmentAPI, bedAPI } from '@/lib/mock-api';
import { formatDate, formatDateTime, formatTime } from '@/lib/utils';
import type { Appointment, Bed } from '@/types';

type Tab = 'opd' | 'ipd';

export default function OpdIpdPage() {
  const [tab, setTab] = useState<Tab>('opd');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [occupiedBeds, setOccupiedBeds] = useState<Bed[]>([]);

  useEffect(() => {
    appointmentAPI.list().then((r) => setAppointments(r.data));
    bedAPI.listBeds().then((r) =>
      setOccupiedBeds(r.data.filter((b) => b.status === 'occupied')),
    );
  }, []);

  const opdAppointments = appointments.filter(
    (a) => a.status !== 'cancelled' && a.appointment_type !== 'teleconsultation',
  );
  const opdCompleted = opdAppointments.filter((a) => a.status === 'completed').length;
  const opdActive = opdAppointments.filter((a) =>
    ['scheduled', 'confirmed', 'checked_in', 'in_progress'].includes(a.status),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="OPD / IPD"
        description="Outpatient and inpatient visit tracking"
      />

      <div className="flex gap-1 rounded-xl border border-border bg-secondary/30 p-1 w-fit">
        {(['opd', 'ipd'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-8 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'opd' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KPICard label="Total OPD Visits" value={opdAppointments.length} icon={Calendar} accentColor="primary" />
            <KPICard label="Active Today" value={opdActive} icon={Activity} accentColor="accent" />
            <KPICard label="Completed" value={opdCompleted} icon={Calendar} accentColor="healthy" />
          </div>

          <SectionCard
            title="OPD Appointments"
            description={`${opdAppointments.length} outpatient visits`}
          >
            {opdAppointments.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Calendar} title="No OPD visits" description="No outpatient appointments recorded." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/30">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3">Patient</th>
                      <th className="px-3 py-3">Doctor</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Scheduled</th>
                      <th className="px-3 py-3">Reason</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {opdAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-secondary/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={a.patient_name} size="sm" />
                            <div>
                              <div className="font-medium">{a.patient_name}</div>
                              <div className="font-mono text-xs text-muted-foreground">{a.patient_mrn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium">{a.doctor_name}</div>
                          <div className="text-xs text-muted-foreground">{a.doctor_specialty}</div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant="secondary" className="capitalize text-[11px]">
                            {a.appointment_type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium">{formatTime(a.scheduled_at)}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(a.scheduled_at)}</div>
                        </td>
                        <td className="px-3 py-3 max-w-[180px]">
                          <div className="truncate text-sm text-muted-foreground">{a.reason}</div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant={
                              a.status === 'completed'
                                ? 'healthy'
                                : a.status === 'checked_in' || a.status === 'in_progress'
                                ? 'accent'
                                : a.status === 'cancelled' || a.status === 'no_show'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {a.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'ipd' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KPICard label="Current Admissions" value={occupiedBeds.length} icon={Activity} accentColor="critical" />
            <KPICard label="Beds Occupied" value={occupiedBeds.length} icon={Activity} accentColor="borderline" />
            <KPICard label="Expected Discharges" value={0} icon={Calendar} accentColor="healthy" />
          </div>

          <SectionCard
            title="Current IPD Admissions"
            description={`${occupiedBeds.length} patients admitted`}
          >
            {occupiedBeds.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Activity} title="No current admissions" description="No inpatients at this time." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/30">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3">Patient</th>
                      <th className="px-3 py-3">MRN</th>
                      <th className="px-3 py-3">Bed</th>
                      <th className="px-3 py-3">Ward</th>
                      <th className="px-3 py-3">Admission Date</th>
                      <th className="px-3 py-3">Daily Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {occupiedBeds.map((bed) => (
                      <tr key={bed.id} className="hover:bg-secondary/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={bed.current_patient_name ?? '?'} size="sm" />
                            <div className="font-medium">{bed.current_patient_name ?? 'Unknown'}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                            {bed.current_patient_mrn ?? '—'}
                          </code>
                        </td>
                        <td className="px-3 py-3 font-mono font-semibold">{bed.bed_number}</td>
                        <td className="px-3 py-3 text-muted-foreground">{bed.ward_name}</td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {bed.admission_date ? formatDate(bed.admission_date) : '—'}
                        </td>
                        <td className="px-3 py-3 tabular-nums">৳{bed.daily_rate_bdt.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

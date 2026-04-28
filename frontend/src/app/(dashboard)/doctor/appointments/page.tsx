'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Video } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { appointmentAPI } from '@/lib/mock-api';
import { formatBDT, formatDateTime } from '@/lib/utils';
import type { Appointment } from '@/types';

export default function DoctorAppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    appointmentAPI.list({ doctor_id: user.id }).then((r) => setAppointments(r.data)).catch(() => setAppointments([]));
  }, [user?.id]);

  const active = appointments.filter((a) => ['scheduled', 'confirmed', 'checked_in', 'in_progress'].includes(a.status));
  const teleconsults = appointments.filter((a) => a.appointment_type === 'teleconsultation').length;
  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()),
    [appointments],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="My Appointments" description="Consultation queue, check-ins, and teleconsultation schedule." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Total" value={appointments.length} icon={Calendar} />
        <KPICard label="Active Queue" value={active.length} icon={Calendar} accentColor="borderline" />
        <KPICard label="Teleconsults" value={teleconsults} icon={Video} accentColor="accent" />
      </div>

      <SectionCard title="Appointment List" description="All scheduled, active, and completed appointments for your patients.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Time</th>
                <th className="px-3 py-3">Patient</th>
                <th className="px-3 py-3">Reason</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Fee</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">{formatDateTime(appointment.scheduled_at)}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{appointment.patient_name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{appointment.patient_mrn}</div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{appointment.reason}</td>
                  <td className="px-3 py-3 capitalize">{appointment.appointment_type.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-3 tabular-nums">{formatBDT(appointment.fee_bdt)}</td>
                  <td className="px-3 py-3">
                    <Badge variant={appointment.status === 'completed' ? 'healthy' : appointment.status === 'checked_in' ? 'accent' : 'secondary'} className="capitalize">
                      {appointment.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

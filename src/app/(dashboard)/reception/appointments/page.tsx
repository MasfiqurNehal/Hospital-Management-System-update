import { Calendar } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_APPOINTMENTS } from '@/lib/mock-data';
import { formatBDT, formatDateTime } from '@/lib/utils';

export default function ReceptionAppointmentsPage() {
  const checkIns = MOCK_APPOINTMENTS.filter((appointment) => ['confirmed', 'checked_in'].includes(appointment.status));

  return (
    <div className="space-y-6">
      <PageHeader title="Reception Appointments" description="Front-desk schedule, check-in status, and walk-in support." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Appointments" value={MOCK_APPOINTMENTS.length} icon={Calendar} />
        <KPICard label="Ready Check-in" value={checkIns.length} icon={Calendar} accentColor="accent" />
        <KPICard label="Collected Fees" value={formatBDT(MOCK_APPOINTMENTS.filter((a) => a.payment_status === 'paid').reduce((sum, a) => sum + a.fee_bdt, 0))} icon={Calendar} accentColor="healthy" />
      </div>

      <SectionCard title="Front Desk Queue" description="SRS Module 3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Time</th>
                <th className="px-3 py-3">Patient</th>
                <th className="px-3 py-3">Doctor</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_APPOINTMENTS.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">{formatDateTime(appointment.scheduled_at)}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{appointment.patient_name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{appointment.patient_mrn}</div>
                  </td>
                  <td className="px-3 py-3">{appointment.doctor_name}</td>
                  <td className="px-3 py-3 capitalize">{appointment.source.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-3"><Badge variant={appointment.payment_status === 'paid' ? 'healthy' : 'warning'}>{appointment.payment_status}</Badge></td>
                  <td className="px-3 py-3"><Badge variant={appointment.status === 'checked_in' ? 'accent' : 'secondary'} className="capitalize">{appointment.status.replace(/_/g, ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

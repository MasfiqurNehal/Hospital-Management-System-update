import { Calendar } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_APPOINTMENTS } from '@/lib/mock-data';
import { formatBDT, formatDateTime } from '@/lib/utils';

const patientId = 'patient-001';

export default function PatientAppointmentsPage() {
  const appointments = MOCK_APPOINTMENTS.filter((appointment) => appointment.patient_id === patientId);
  const upcoming = appointments.filter((appointment) => new Date(appointment.scheduled_at) >= new Date());

  return (
    <div className="space-y-6">
      <PageHeader title="My Appointments" description="Upcoming consultations, visit history, and telemedicine links." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Upcoming" value={upcoming.length} icon={Calendar} />
        <KPICard label="Completed" value={appointments.filter((appointment) => appointment.status === 'completed').length} icon={Calendar} accentColor="healthy" />
        <KPICard label="Total Fees" value={formatBDT(appointments.reduce((sum, appointment) => sum + appointment.fee_bdt, 0))} icon={Calendar} accentColor="accent" />
      </div>

      <SectionCard title="Appointment History" description="SRS Module 3">
        <div className="divide-y divide-border">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="font-semibold">{appointment.doctor_name}</div>
                <div className="text-sm text-muted-foreground">{appointment.doctor_specialty} - {appointment.reason}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(appointment.scheduled_at)}</div>
              </div>
              <Badge variant={appointment.status === 'completed' ? 'healthy' : appointment.status === 'confirmed' ? 'accent' : 'secondary'} className="capitalize">
                {appointment.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

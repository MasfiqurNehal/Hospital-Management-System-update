import { Activity, Calendar, FileText, FlaskConical } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { MOCK_HEALTH_TIMELINE } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';

const patientId = 'patient-001';

export default function PatientTimelinePage() {
  const timeline = MOCK_HEALTH_TIMELINE.filter((event) => event.patient_id === patientId);

  return (
    <div className="space-y-6">
      <PageHeader title="Health Timeline" description="A chronological view of appointments, prescriptions, lab reports, and care events." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Events" value={timeline.length} icon={Activity} />
        <KPICard label="Appointments" value={timeline.filter((event) => event.event_type === 'appointment').length} icon={Calendar} accentColor="primary" />
        <KPICard label="Clinical Records" value={timeline.filter((event) => event.event_type !== 'appointment').length} icon={FileText} accentColor="accent" />
      </div>

      <SectionCard title="Medical History" description="SRS patient continuity record">
        <div className="p-5">
          <div className="space-y-5">
            {timeline.map((event, index) => {
              const Icon = event.event_type === 'lab_test' ? FlaskConical : event.event_type === 'appointment' ? Calendar : FileText;

              return (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    {index < timeline.length - 1 && <div className="mt-2 h-10 w-px bg-border" />}
                  </div>
                  <div>
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{event.description}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(event.event_date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

import { HeartPulse } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_BEDS } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

const occupiedBeds = MOCK_BEDS.filter((bed) => bed.status === 'occupied').slice(0, 8);

export default function NurseVitalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Vitals Entry" description="Record ward vitals and flag abnormal readings for doctor review." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Patients Due" value={occupiedBeds.length} icon={HeartPulse} />
        <KPICard label="Critical Flags" value={1} icon={HeartPulse} accentColor="critical" />
        <KPICard label="Completed Rounds" value={5} icon={HeartPulse} accentColor="healthy" />
      </div>

      <SectionCard title="Vitals Round" description="SRS nursing workflow">
        <div className="divide-y divide-border">
          {occupiedBeds.map((bed, index) => (
            <div key={bed.id} className="grid gap-3 px-5 py-4 md:grid-cols-6 md:items-center">
              <div>
                <div className="font-semibold">{bed.current_patient_name}</div>
                <div className="font-mono text-xs text-muted-foreground">{bed.current_patient_mrn}</div>
              </div>
              <div className="text-sm">Bed {bed.bed_number}</div>
              <div className="text-sm">BP {index === 1 ? '160/96' : '120/80'}</div>
              <div className="text-sm">Pulse {index === 1 ? '112' : '78'}</div>
              <div className="text-sm">Temp {index === 2 ? '101.2 F' : '98.4 F'}</div>
              <Badge variant={index === 1 ? 'critical' : index === 2 ? 'warning' : 'healthy'}>
                {index === 1 ? 'Doctor review' : index === 2 ? 'Observe' : 'Stable'}
              </Badge>
              <div className="text-xs text-muted-foreground md:col-span-6">
                Admitted {bed.admission_date ? formatDate(bed.admission_date) : 'recently'}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

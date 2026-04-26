import { FlaskConical } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_LAB_TESTS } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';

const doctorId = 'user-doc-001';

export default function DoctorLabOrdersPage() {
  const tests = MOCK_LAB_TESTS.filter((test) => test.ordered_by_doctor_id === doctorId);
  const critical = tests.filter((test) => test.overall_flag === 'critical').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Orders" description="Track ordered investigations, samples, and critical result alerts." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Orders" value={tests.length} icon={FlaskConical} />
        <KPICard label="Pending" value={tests.filter((test) => test.status !== 'reported').length} icon={FlaskConical} accentColor="borderline" />
        <KPICard label="Critical" value={critical} icon={FlaskConical} accentColor="critical" />
      </div>

      <SectionCard title="Investigation Orders" description="SRS Module 5">
        <div className="divide-y divide-border">
          {tests.map((test) => (
            <div key={test.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="font-semibold">{test.test_name}</div>
                <div className="text-sm text-muted-foreground">{test.patient_name} ({test.patient_mrn})</div>
                <code className="text-xs text-muted-foreground">{test.test_number}</code>
              </div>
              <div className="text-sm text-muted-foreground">{formatDateTime(test.ordered_at)}</div>
              <div className="flex gap-2">
                <Badge variant={test.overall_flag === 'critical' ? 'critical' : test.overall_flag === 'borderline' ? 'borderline' : 'healthy'}>
                  {test.overall_flag}
                </Badge>
                <Badge variant={test.status === 'reported' ? 'healthy' : 'accent'} className="capitalize">
                  {test.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

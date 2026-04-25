import { FlaskConical } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_LAB_TESTS } from '@/lib/mock-data';
import { formatDateTime, formatBDT } from '@/lib/utils';

export default function LabPendingPage() {
  const tests = MOCK_LAB_TESTS.filter((test) => ['ordered', 'sample_collected', 'in_progress'].includes(test.status));

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Lab Tests" description="Sample collection, processing, and result entry queue." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Pending Queue" value={tests.length} icon={FlaskConical} accentColor="borderline" />
        <KPICard label="STAT / Urgent" value={tests.filter((test) => ['stat', 'urgent', 'critical'].includes(test.priority)).length} icon={FlaskConical} accentColor="critical" />
        <KPICard label="Expected Revenue" value={formatBDT(tests.reduce((sum, test) => sum + test.price_bdt, 0))} icon={FlaskConical} />
      </div>

      <SectionCard title="Work Queue" description="SRS Module 5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Test</th>
                <th className="px-3 py-3">Patient</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Ordered</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="font-medium">{test.test_name}</div>
                    <code className="text-xs text-muted-foreground">{test.test_number}</code>
                  </td>
                  <td className="px-3 py-3">{test.patient_name}</td>
                  <td className="px-3 py-3">
                    <Badge variant={test.priority === 'routine' ? 'secondary' : 'critical'} className="capitalize">{test.priority}</Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDateTime(test.ordered_at)}</td>
                  <td className="px-3 py-3">
                    <Badge variant={test.status === 'in_progress' ? 'accent' : 'warning'} className="capitalize">{test.status.replace(/_/g, ' ')}</Badge>
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

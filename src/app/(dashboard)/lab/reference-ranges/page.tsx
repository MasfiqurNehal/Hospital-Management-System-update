import { ClipboardList } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';

const ranges = [
  { test: 'Complete Blood Count', parameter: 'Hemoglobin', range: '12.0 - 15.5 g/dL', flag: 'critical below 9.5' },
  { test: 'Complete Blood Count', parameter: 'WBC Count', range: '4.5 - 11.0 10^3/uL', flag: 'critical above 25.0' },
  { test: 'Complete Blood Count', parameter: 'Platelets', range: '150 - 400 10^3/uL', flag: 'critical below 50' },
  { test: 'Lipid Profile', parameter: 'LDL Cholesterol', range: '< 100 mg/dL', flag: 'high above 160' },
  { test: 'Lipid Profile', parameter: 'Triglycerides', range: '< 150 mg/dL', flag: 'high above 200' },
];

export default function LabReferenceRangesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reference Ranges" description="Lab value ranges used for normal, borderline, and critical flagging." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Catalog Tests" value={2} icon={ClipboardList} />
        <KPICard label="Parameters" value={ranges.length} icon={ClipboardList} accentColor="accent" />
        <KPICard label="Critical Rules" value={ranges.length} icon={ClipboardList} accentColor="critical" />
      </div>

      <SectionCard title="Reference Range Catalog" description="SRS FR-LAB-01">
        <div className="divide-y divide-border">
          {ranges.map((item) => (
            <div key={`${item.test}-${item.parameter}`} className="grid gap-2 px-5 py-4 sm:grid-cols-4 sm:items-center">
              <div className="font-medium">{item.test}</div>
              <div>{item.parameter}</div>
              <div className="font-mono text-sm text-muted-foreground">{item.range}</div>
              <Badge variant="borderline">{item.flag}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

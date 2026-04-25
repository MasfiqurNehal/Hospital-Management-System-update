import { Users } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MOCK_PATIENTS } from '@/lib/mock-data';
import { generateMRN } from '@/lib/utils';

export default function ReceptionRegisterPatientPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Register Patient" description="Front-desk registration form prepared for Laravel/PostgreSQL persistence." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Existing Patients" value={MOCK_PATIENTS.length} icon={Users} />
        <KPICard label="Next MRN Preview" value={generateMRN()} icon={Users} accentColor="accent" />
        <KPICard label="Required ID" value="NID / Birth Cert" icon={Users} accentColor="borderline" />
      </div>

      <SectionCard title="Patient Registration Form" description="SRS FR-PAT-01">
        <form className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <Label>Full name</Label>
            <Input placeholder="Md. Rahim Uddin" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input placeholder="1712345678" />
          </div>
          <div>
            <Label>Date of birth</Label>
            <Input type="date" />
          </div>
          <div>
            <Label>Gender</Label>
            <Input placeholder="male / female / other" />
          </div>
          <div>
            <Label>NID or birth certificate</Label>
            <Input placeholder="10, 13, or 17 digit identifier" />
          </div>
          <div>
            <Label>Blood group</Label>
            <Input placeholder="B+" />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input placeholder="House, road, area, city" />
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-lg bg-secondary/30 p-4">
            <div>
              <div className="font-medium">Ready for backend integration</div>
              <div className="text-sm text-muted-foreground">This UI will submit to Laravel patient registration API later.</div>
            </div>
            <Badge variant="accent">Mock form</Badge>
          </div>
          <div className="md:col-span-2">
            <Button type="button">Save Patient</Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

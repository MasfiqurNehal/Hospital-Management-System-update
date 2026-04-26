import { Bed } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_BEDS, MOCK_WARDS } from '@/lib/mock-data';
import { formatBDT } from '@/lib/utils';

export default function NurseWardPage() {
  const ward = MOCK_WARDS.find((item) => item.name === 'ICU Ward 2') ?? MOCK_WARDS[0];
  const beds = MOCK_BEDS.filter((bed) => bed.ward_id === ward.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Ward View" description="Assigned ward occupancy, bed status, and patient allocation." />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPICard label="Ward Beds" value={ward.total_beds} icon={Bed} />
        <KPICard label="Occupied" value={ward.occupied_beds} icon={Bed} accentColor="critical" />
        <KPICard label="Available" value={ward.available_beds} icon={Bed} accentColor="healthy" />
        <KPICard label="Daily Rate" value={formatBDT(ward.daily_rate_bdt ?? 0)} icon={Bed} accentColor="accent" />
      </div>

      <SectionCard title={ward.name} description={`${ward.floor} occupancy ${ward.occupancy_rate}%`}>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {beds.map((bed) => (
            <div key={bed.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="font-bold">{bed.bed_number}</div>
                <Badge variant={bed.status === 'available' ? 'healthy' : bed.status === 'occupied' ? 'critical' : 'secondary'} className="capitalize">
                  {bed.status}
                </Badge>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {bed.current_patient_name ?? 'Ready for allocation'}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

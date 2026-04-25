'use client';

import { useEffect, useState } from 'react';
import { Bed as BedIcon, Users } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { bedAPI } from '@/lib/mock-api';
import { formatDate, cn } from '@/lib/utils';
import type { Bed, Ward } from '@/types';

export default function BedsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([bedAPI.listWards(), bedAPI.listBeds()]).then(([wardsRes, bedsRes]) => {
      setWards(wardsRes.data);
      setBeds(bedsRes.data);
      if (wardsRes.data.length > 0) setSelectedWardId(wardsRes.data[0].id);
    });
  }, []);

  const totalBeds = wards.reduce((s, w) => s + w.total_beds, 0);
  const occupiedBeds = wards.reduce((s, w) => s + w.occupied_beds, 0);
  const availableBeds = wards.reduce((s, w) => s + w.available_beds, 0);
  const overallOccupancy = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';

  const selectedWard = wards.find((w) => w.id === selectedWardId);
  const wardBeds = beds.filter((b) => b.ward_id === selectedWardId);

  function wardTypeLabel(type: Ward['ward_type']) {
    const map: Record<Ward['ward_type'], string> = {
      general: 'General',
      private: 'Private',
      cabin: 'Cabin',
      icu: 'ICU',
      ccu: 'CCU',
      nicu: 'NICU',
      picu: 'PICU',
      emergency: 'Emergency',
      isolation: 'Isolation',
      maternity: 'Maternity',
    };
    return map[type] ?? type;
  }

  function occupancyVariant(rate: number) {
    if (rate >= 90) return 'critical';
    if (rate >= 75) return 'warning';
    return 'healthy';
  }

  function bedStatusColor(status: Bed['status']) {
    switch (status) {
      case 'occupied': return 'bg-critical/80 text-white border-critical';
      case 'reserved': return 'bg-borderline/80 text-white border-borderline';
      case 'maintenance': return 'bg-muted text-muted-foreground border-border';
      case 'cleaning': return 'bg-accent/30 text-accent border-accent/50';
      default: return 'bg-healthy/20 text-healthy border-healthy/50';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beds & Wards"
        description="Real-time bed occupancy and ward management"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total Beds" value={totalBeds} icon={BedIcon} accentColor="primary" />
        <KPICard label="Occupied" value={occupiedBeds} icon={BedIcon} accentColor="critical" />
        <KPICard label="Available" value={availableBeds} icon={BedIcon} accentColor="healthy" />
        <KPICard label="Occupancy Rate" value={`${overallOccupancy}%`} icon={Users} accentColor="borderline" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {wards.map((ward) => (
          <div
            key={ward.id}
            onClick={() => setSelectedWardId(ward.id)}
            className={cn(
              'cursor-pointer rounded-xl border p-4 transition-all hover:shadow-elevated',
              selectedWardId === ward.id
                ? 'border-primary bg-primary/5 shadow-elevated'
                : 'border-border bg-card',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-foreground">{ward.name}</div>
                <div className="text-xs text-muted-foreground">{ward.floor}</div>
              </div>
              <Badge variant={occupancyVariant(ward.occupancy_rate)} className="shrink-0 text-[10px]">
                {wardTypeLabel(ward.ward_type)}
              </Badge>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Occupancy</span>
                <span className="font-semibold text-foreground">{ward.occupancy_rate.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    ward.occupancy_rate >= 90
                      ? 'bg-critical'
                      : ward.occupancy_rate >= 75
                      ? 'bg-borderline'
                      : 'bg-healthy',
                  )}
                  style={{ width: `${ward.occupancy_rate}%` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1 text-center text-xs">
              <div>
                <div className="font-semibold text-critical">{ward.occupied_beds}</div>
                <div className="text-muted-foreground">Occupied</div>
              </div>
              <div>
                <div className="font-semibold text-healthy">{ward.available_beds}</div>
                <div className="text-muted-foreground">Free</div>
              </div>
              <div>
                <div className="font-semibold text-borderline">{ward.reserved_beds}</div>
                <div className="text-muted-foreground">Reserved</div>
              </div>
            </div>

            {ward.daily_rate_bdt && (
              <div className="mt-2 text-xs text-muted-foreground">
                ৳{ward.daily_rate_bdt.toLocaleString()} / day
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedWard && (
        <SectionCard
          title={`${selectedWard.name} — Bed Map`}
          description={`${selectedWard.total_beds} total beds · Click a bed to see patient info`}
          action={
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-critical/80" /> Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-healthy/20 border border-healthy/50" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-borderline/80" /> Reserved
              </span>
            </div>
          }
        >
          <div className="p-5">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {wardBeds.map((bed) => (
                <BedCard key={bed.id} bed={bed} />
              ))}
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function BedCard({ bed }: { bed: Bed }) {
  const [showTooltip, setShowTooltip] = useState(false);

  function bedStatusColor(status: Bed['status']) {
    switch (status) {
      case 'occupied': return 'bg-critical/80 text-white border-critical hover:bg-critical';
      case 'reserved': return 'bg-borderline/80 text-white border-borderline hover:bg-borderline';
      case 'maintenance': return 'bg-muted text-muted-foreground border-border';
      case 'cleaning': return 'bg-accent/20 text-accent border-accent/50';
      default: return 'bg-healthy/10 text-healthy border-healthy/40 hover:bg-healthy/20';
    }
  }

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border p-2 text-center transition-all',
          bedStatusColor(bed.status),
        )}
      >
        <BedIcon className="h-4 w-4 mb-0.5" />
        <span className="text-[10px] font-bold leading-tight">{bed.bed_number}</span>
      </div>

      {showTooltip && bed.status === 'occupied' && bed.current_patient_name && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-40 -translate-x-1/2 rounded-lg border border-border bg-card p-2 shadow-elevated text-xs">
          <div className="font-semibold text-foreground truncate">{bed.current_patient_name}</div>
          <div className="font-mono text-muted-foreground">{bed.current_patient_mrn}</div>
          {bed.admission_date && (
            <div className="text-muted-foreground">Since {formatDate(bed.admission_date)}</div>
          )}
        </div>
      )}
    </div>
  );
}

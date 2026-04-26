'use client';

import { useEffect, useState } from 'react';
import { Activity, Bed, Users } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { bedAPI, alertAPI } from '@/lib/mock-api';
import { useAuthStore } from '@/lib/auth-store';
import { formatDate, formatRelative } from '@/lib/utils';
import type { Bed as BedType, Ward, InAppNotification } from '@/types';

export default function NurseDashboardPage() {
  const { user } = useAuthStore();
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<BedType[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    bedAPI.listWards().then((r) => setWards(r.data));
    bedAPI.listBeds().then((r) => setBeds(r.data));
    alertAPI.getNotifications().then((r) => setNotifications(r.data));
  }, []);

  const assignedWard = user?.nurse_profile?.ward_assigned;
  const wardData = wards.find((w) => assignedWard && w.name.includes(assignedWard.split(' ')[0]));
  const wardBeds = wardData ? beds.filter((b) => b.ward_id === wardData.id) : beds;
  const occupiedBeds = wardBeds.filter((b) => b.status === 'occupied');
  const availableBeds = wardBeds.filter((b) => b.status === 'available');
  const unreadAlerts = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.full_name ?? 'Nurse'}`}
        description={
          user?.nurse_profile
            ? `${user.nurse_profile.ward_assigned ?? 'Ward'} · ${user.nurse_profile.shift} shift`
            : 'Your nursing workspace'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Assigned Patients" value={occupiedBeds.length} icon={Users} accentColor="primary" />
        <KPICard label="Available Beds" value={availableBeds.length} icon={Bed} accentColor="healthy" />
        <KPICard label="Total Ward Beds" value={wardBeds.length} icon={Bed} accentColor="accent" />
        <KPICard label="Unread Alerts" value={unreadAlerts} icon={Activity} accentColor="critical" />
      </div>

      {user?.nurse_profile && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">License No.</div>
            <div className="mt-1 font-mono font-semibold">{user.nurse_profile.license_number}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Assigned Ward</div>
            <div className="mt-1 font-semibold">{user.nurse_profile.ward_assigned ?? '—'}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Shift</div>
            <div className="mt-1 font-semibold capitalize">{user.nurse_profile.shift}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Patient Assignments"
          description={`${occupiedBeds.length} patients in ward`}
        >
          {occupiedBeds.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Users} title="No patients assigned" description="No occupied beds in your ward." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {occupiedBeds.map((bed) => (
                <div key={bed.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-critical/10 text-xs font-bold text-critical">
                    {bed.bed_number}
                  </div>
                  <Avatar name={bed.current_patient_name ?? '?'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{bed.current_patient_name ?? 'Unknown'}</div>
                    <div className="font-mono text-xs text-muted-foreground">{bed.current_patient_mrn}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">
                      {bed.admission_date ? `Since ${formatDate(bed.admission_date)}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ৳{bed.daily_rate_bdt.toLocaleString()}/day
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Alerts & Notifications" description="Recent system alerts">
          {notifications.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Activity} title="No alerts" description="All clear — no pending notifications." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-secondary/30 ${!n.is_read ? 'bg-secondary/20' : ''}`}>
                  <div
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.severity === 'critical' ? 'bg-critical pulse-critical'
                      : n.severity === 'high' ? 'bg-orange-500'
                      : n.severity === 'medium' ? 'bg-borderline'
                      : 'bg-accent'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-medium">{n.title}</div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">{n.message}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{formatRelative(n.created_at)}</div>
                  </div>
                  {!n.is_read && (
                    <div className="h-2 w-2 shrink-0 mt-1.5 rounded-full bg-accent" />
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Ward Overview"
        description={`${wards.length} wards total`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Ward</th>
                <th className="px-3 py-3">Floor</th>
                <th className="px-3 py-3">Occupied</th>
                <th className="px-3 py-3">Available</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Occupancy</th>
                <th className="px-3 py-3">Head Nurse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {wards.map((ward) => (
                <tr key={ward.id} className={`hover:bg-secondary/30 ${wardData?.id === ward.id ? 'bg-primary/5' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium">{ward.name}</div>
                    <Badge variant="secondary" className="text-[10px] capitalize">{ward.ward_type}</Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{ward.floor}</td>
                  <td className="px-3 py-3 font-semibold text-critical">{ward.occupied_beds}</td>
                  <td className="px-3 py-3 font-semibold text-healthy">{ward.available_beds}</td>
                  <td className="px-3 py-3">{ward.total_beds}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${ward.occupancy_rate >= 90 ? 'bg-critical' : ward.occupancy_rate >= 75 ? 'bg-borderline' : 'bg-healthy'}`}
                          style={{ width: `${ward.occupancy_rate}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-xs">{ward.occupancy_rate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {ward.head_nurse_name ?? '—'}
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

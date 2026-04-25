'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { dashboardAPI } from '@/lib/mock-api';
import { formatBDT, cn } from '@/lib/utils';
import type { ChartDataPoint, DoctorPerformance } from '@/types';

export default function AnalyticsPage() {
  const [revenueTrend, setRevenueTrend] = useState<ChartDataPoint[]>([]);
  const [visitsTrend, setVisitsTrend] = useState<ChartDataPoint[]>([]);
  const [deptRevenue, setDeptRevenue] = useState<ChartDataPoint[]>([]);
  const [doctorPerf, setDoctorPerf] = useState<DoctorPerformance[]>([]);

  useEffect(() => {
    dashboardAPI.getRevenueTrend().then((r) => setRevenueTrend(r.data));
    dashboardAPI.getPatientVisitsTrend().then((r) => setVisitsTrend(r.data));
    dashboardAPI.getDepartmentRevenue().then((r) => setDeptRevenue(r.data));
    dashboardAPI.getDoctorPerformance().then((r) => setDoctorPerf(r.data));
  }, []);

  const maxRevenue = Math.max(...revenueTrend.map((d) => d.value), 1);
  const maxVisits = Math.max(...visitsTrend.map((d) => d.value), 1);
  const maxDeptRevenue = Math.max(...deptRevenue.map((d) => d.value), 1);

  const totalWeekRevenue = revenueTrend.reduce((s, d) => s + d.value, 0);
  const avgDailyRevenue = totalWeekRevenue / Math.max(revenueTrend.length, 1);
  const totalMonthVisits = visitsTrend.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reporting"
        description="Revenue, patient visits, department performance and doctor metrics"
        actions={
          <Badge variant="healthy" className="gap-1">
            <TrendingUp className="h-3 w-3" /> Live Data
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Week Revenue" value={formatBDT(totalWeekRevenue)} icon={BarChart3} accentColor="healthy" />
        <KPICard label="Avg Daily Revenue" value={formatBDT(Math.round(avgDailyRevenue))} icon={BarChart3} accentColor="primary" />
        <KPICard label="Month Visits" value={totalMonthVisits.toLocaleString()} icon={BarChart3} accentColor="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Daily Revenue — Last 7 Days"
          description="Revenue across all departments"
          action={<Badge variant="healthy" className="gap-1"><TrendingUp className="h-3 w-3" /> +15.2%</Badge>}
        >
          <div className="p-5">
            <div className="flex h-48 items-end gap-2">
              {revenueTrend.map((d, i) => {
                const pct = (d.value / maxRevenue) * 100;
                return (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/70 opacity-0 animate-fade-up transition-all hover:opacity-80"
                        style={{ height: `${pct}%`, animationDelay: `${i * 60}ms` }}
                        title={formatBDT(d.value)}
                      />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">{d.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Week total</div>
                <div className="font-semibold">{formatBDT(totalWeekRevenue)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Daily avg</div>
                <div className="font-semibold">{formatBDT(Math.round(avgDailyRevenue))}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Best day</div>
                <div className="font-semibold">{formatBDT(maxRevenue)}</div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Patient Visits — Monthly Trend" description="Total visits per week this month">
          <div className="p-5">
            <div className="flex h-48 items-end gap-3">
              {visitsTrend.map((d, i) => {
                const pct = (d.value / maxVisits) * 100;
                return (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full text-center text-xs font-semibold text-foreground">
                      {d.value.toLocaleString()}
                    </div>
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-accent to-accent/60 opacity-0 animate-fade-up"
                        style={{ height: `${pct}%`, animationDelay: `${i * 80}ms` }}
                        title={d.value.toLocaleString()}
                      />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">{d.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-border pt-4 text-sm">
              <div className="text-xs text-muted-foreground">Month total</div>
              <div className="font-semibold">{totalMonthVisits.toLocaleString()} visits</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Revenue by Department" description="This month's revenue breakdown per specialty">
        <div className="p-5 space-y-3">
          {deptRevenue.map((d) => {
            const pct = (d.value / maxDeptRevenue) * 100;
            return (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{d.label}</span>
                  <span className="tabular-nums text-muted-foreground">{formatBDT(d.value)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Doctor Performance" description="Patient count, revenue, and satisfaction scores">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Doctor</th>
                <th className="px-3 py-3">Specialty</th>
                <th className="px-3 py-3">Patients Seen</th>
                <th className="px-3 py-3">Revenue Generated</th>
                <th className="px-3 py-3">Avg Duration</th>
                <th className="px-3 py-3">Satisfaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctorPerf.map((doc) => {
                const satisfactionScore = doc.patient_satisfaction_score ?? 0;

                return (
                <tr key={doc.doctor_id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={doc.doctor_name} size="sm" />
                      <span className="font-medium">{doc.doctor_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{doc.specialty}</td>
                  <td className="px-3 py-3 tabular-nums font-semibold">{doc.patients_seen.toLocaleString()}</td>
                  <td className="px-3 py-3 tabular-nums font-medium">{formatBDT(doc.revenue_generated_bdt)}</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">{doc.avg_appointment_minutes} min</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums font-semibold">{satisfactionScore.toFixed(1)}</span>
                      <span className="text-borderline">★</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-healthy"
                          style={{ width: `${(satisfactionScore / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

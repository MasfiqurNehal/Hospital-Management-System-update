'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Shield, Users } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { alertAPI, dashboardAPI, patientAPI, tenantAPI, userAPI } from '@/lib/mock-api';
import { formatDate, formatDateTime, formatRelative } from '@/lib/utils';
import type { Alert, DashboardKPIs, Patient, Tenant, User } from '@/types';

export default function SuperAdminDashboardPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [staff, setStaff] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [tenantRes, staffRes, doctorRes, patientRes, alertRes, kpiRes] = await Promise.allSettled([
        tenantAPI.getCurrent(),
        userAPI.list(),
        userAPI.listDoctors(),
        patientAPI.list(),
        alertAPI.list(),
        dashboardAPI.getKPIs(),
      ]);

      if (cancelled) return;

      if (tenantRes.status === 'fulfilled') setTenant(tenantRes.value.data);
      if (staffRes.status === 'fulfilled') setStaff(staffRes.value.data);
      if (doctorRes.status === 'fulfilled') setDoctors(doctorRes.value.data);
      if (patientRes.status === 'fulfilled') setPatients(patientRes.value.data);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value.data);
      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeDoctors = doctors.filter((doctor) => doctor.status === 'active').length;
  const activeStaff = staff.filter((member) => member.status === 'active').length;
  const openAlerts = alerts.filter((alert) => !alert.acknowledged_at);
  const criticalAlerts = openAlerts.filter((alert) => alert.severity === 'critical');

  const recentPatients = useMemo(
    () => [...patients].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [patients],
  );
  const recentAlerts = useMemo(
    () => [...alerts].sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()).slice(0, 6),
    [alerts],
  );

  const planColors: Record<string, 'accent' | 'healthy' | 'borderline' | 'critical'> = {
    starter: 'accent',
    professional: 'healthy',
    business: 'healthy',
    enterprise: 'borderline',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Live platform summary built from tenant, staff, doctor, patient, KPI, and alert data."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Current Tenant" value={tenant ? 1 : 0} icon={Building2} accentColor="primary" />
        <KPICard label="Doctors" value={activeDoctors} icon={Users} accentColor="healthy" />
        <KPICard label="Patients" value={(kpis?.total_patients ?? patients.length).toLocaleString()} icon={Users} accentColor="accent" />
        <KPICard label="Open Alerts" value={openAlerts.length} icon={Shield} accentColor="borderline" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Beds</div>
          <div className="mt-1 text-2xl font-bold">{tenant?.usage.bed_count.toLocaleString() ?? 0}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Active Staff</div>
          <div className="mt-1 text-2xl font-bold">{activeStaff}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Critical Alerts</div>
          <div className="mt-1 text-2xl font-bold text-critical">{kpis?.critical_alerts ?? criticalAlerts.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Appointments Today</div>
          <div className="mt-1 text-2xl font-bold">{kpis?.appointments_today ?? 0}</div>
        </div>
      </div>

      <SectionCard title="Tenant Registry" description="Current tenant record pulled from the live API.">
        {!tenant ? (
          <div className="p-6">
            <EmptyState icon={Building2} title="No tenant data" description="The tenant API did not return a record." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Hospital</th>
                  <th className="px-3 py-3">Subdomain</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Patients</th>
                  <th className="px-3 py-3">Beds</th>
                  <th className="px-3 py-3">Staff</th>
                  <th className="px-3 py-3">Renews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ backgroundColor: tenant.branding.primary_color }}
                      >
                        {tenant.branding.hospital_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{tenant.branding.hospital_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tenant.address.city}, {tenant.address.division}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <code className="rounded bg-secondary px-2 py-0.5 text-xs">{tenant.subdomain}.hms.com.bd</code>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={planColors[tenant.plan] ?? 'secondary'} className="capitalize">
                      {tenant.plan}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={tenant.status === 'active' ? 'healthy' : tenant.status === 'suspended' ? 'critical' : 'secondary'}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{tenant.usage.patient_count.toLocaleString()}</td>
                  <td className="px-3 py-3 tabular-nums">{tenant.usage.bed_count}</td>
                  <td className="px-3 py-3 tabular-nums">{tenant.usage.active_staff_count}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {tenant.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : 'Not set'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Doctor Roster" description={`${doctors.length} doctor${doctors.length === 1 ? '' : 's'} loaded from the live user API.`}>
          <div className="divide-y divide-border">
            {doctors.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Users} title="No doctors" description="No doctor records are available right now." />
              </div>
            ) : (
              doctors.slice(0, 6).map((doctor) => (
                <div key={doctor.id} className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-secondary/30">
                  <div>
                    <div className="font-medium">{doctor.full_name}</div>
                    <div className="text-xs text-muted-foreground">{doctor.email}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {doctor.doctor_profile?.specialty ?? 'General'} · {doctor.doctor_profile?.years_of_experience ?? 0} years
                    </div>
                  </div>
                  <Badge variant={doctor.status === 'active' ? 'healthy' : 'secondary'} className="capitalize">
                    {doctor.doctor_profile?.consultation_fee_bdt ? `৳${doctor.doctor_profile.consultation_fee_bdt}` : 'No fee'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recent Patients" description={`${patients.length} patients loaded from the live patient API.`}>
          <div className="divide-y divide-border">
            {recentPatients.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Users} title="No patients" description="Patient records will appear here once the API responds." />
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-secondary/30">
                  <div>
                    <div className="font-medium">{patient.full_name}</div>
                    <div className="text-xs text-muted-foreground">{patient.mrn} · {patient.phone.number}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {patient.gender} · {patient.patient_type.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{patient.outstanding_balance_bdt ? `৳${patient.outstanding_balance_bdt}` : 'Settled'}</div>
                    <div>{formatRelative(patient.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Platform Alerts" description={`${alerts.length} alert${alerts.length === 1 ? '' : 's'} loaded from the live alert API.`}>
          <div className="divide-y divide-border">
            {recentAlerts.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Shield} title="No alerts" description="No platform alerts are currently available." />
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="px-5 py-4 hover:bg-secondary/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-xs text-muted-foreground">{alert.message}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {formatDateTime(alert.triggered_at)}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'warning' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <Badge variant={alert.acknowledged_at ? 'healthy' : 'warning'}>
                        {alert.acknowledged_at ? 'acknowledged' : 'open'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Quick Stats" description="Platform-wide numbers">
          <div className="p-5 space-y-4">
            {tenant && (
              <>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Subscription started</span>
                  <span className="text-sm font-medium">
                    {tenant.subscription_started_at ? formatDate(tenant.subscription_started_at) : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Next renewal</span>
                  <span className="text-sm font-medium">
                    {tenant.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Alert channels</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {tenant.limits.alert_channels.map((ch) => (
                      <Badge key={ch} variant="accent" className="text-[10px] capitalize">
                        {ch.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">SLA Response</span>
                  <span className="text-sm font-medium">{tenant.limits.sla_response_hours}h</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Telemedicine</span>
                  <Badge variant={tenant.limits.has_telemedicine ? 'healthy' : 'secondary'}>
                    {tenant.limits.has_telemedicine ? 'enabled' : 'disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max patients</span>
                  <span className="text-sm font-medium">
                    {tenant.limits.max_patients ? tenant.limits.max_patients.toLocaleString() : 'Unlimited'}
                  </span>
                </div>
              </>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

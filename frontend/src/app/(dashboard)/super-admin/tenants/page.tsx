'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { dashboardAPI, patientAPI, tenantAPI, userAPI } from '@/lib/mock-api';
import { formatDate } from '@/lib/utils';
import type { DashboardKPIs, Patient, Tenant, User } from '@/types';

export default function SuperAdminTenantsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [staff, setStaff] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [tenantRes, staffRes, doctorRes, patientRes, kpiRes] = await Promise.allSettled([
        tenantAPI.getCurrent(),
        userAPI.list(),
        userAPI.listDoctors(),
        patientAPI.list(),
        dashboardAPI.getKPIs(),
      ]);

      if (cancelled) return;

      if (tenantRes.status === 'fulfilled') setTenant(tenantRes.value.data);
      if (staffRes.status === 'fulfilled') setStaff(staffRes.value.data);
      if (doctorRes.status === 'fulfilled') setDoctors(doctorRes.value.data);
      if (patientRes.status === 'fulfilled') setPatients(patientRes.value.data);
      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeStaff = staff.filter((member) => member.status === 'active').length;
  const currentTenantCount = tenant ? 1 : 0;
  const featureList = tenant
    ? [
        tenant.limits.has_telemedicine && 'Telemedicine',
        tenant.limits.has_emergency_module && 'Emergency',
        tenant.limits.has_pharma_portal && 'Pharmacy',
        tenant.limits.has_ai_features && 'AI Features',
        tenant.limits.has_white_label && 'White Label',
      ].filter(Boolean)
    : [];

  const tenantSummary = useMemo(() => {
    if (!tenant) return [];
    return [
      { label: 'Hospital', value: tenant.branding.hospital_name },
      { label: 'Domain', value: `${tenant.subdomain}.hms.com.bd` },
      { label: 'Plan', value: tenant.plan },
      { label: 'Status', value: tenant.status },
      { label: 'Subscription Renewal', value: tenant.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : 'Not set' },
      { label: 'Patients', value: tenant.usage.patient_count.toLocaleString() },
      { label: 'Beds', value: tenant.usage.bed_count.toLocaleString() },
      { label: 'Staff', value: tenant.usage.active_staff_count.toLocaleString() },
    ];
  }, [tenant]);

  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" description="Live tenant snapshot with current platform usage and staff counts." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Current Tenants" value={currentTenantCount} icon={Building2} />
        <KPICard label="Doctors" value={doctors.length} icon={Building2} accentColor="accent" />
        <KPICard label="Patients" value={(kpis?.total_patients ?? patients.length).toLocaleString()} icon={Building2} accentColor="healthy" />
        <KPICard label="Active Staff" value={activeStaff} icon={Building2} accentColor="borderline" />
      </div>

      <SectionCard title="Tenant Registry" description="Current tenant record from the backend">
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
                  <th className="px-3 py-3">Domain</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Usage</th>
                  <th className="px-3 py-3">Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="font-medium">{tenant.branding.hospital_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {tenant.address.city}, {tenant.address.division}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <code className="rounded bg-secondary px-2 py-0.5 text-xs">{tenant.subdomain}.hms.com.bd</code>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="healthy" className="capitalize">
                      {tenant.plan}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={tenant.status === 'active' ? 'healthy' : tenant.status === 'suspended' ? 'critical' : 'secondary'} className="capitalize">
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {tenant.usage.active_staff_count} staff, {tenant.usage.bed_count} beds
                  </td>
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
        <SectionCard title="Tenant Details" description="Live plan limits and subscription state">
          <div className="p-5 space-y-4">
            {!tenant ? (
              <EmptyState icon={Building2} title="No details" description="Tenant details are unavailable." />
            ) : (
              <>
                {tenantSummary.map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Feature Flags" description="Capabilities enabled for the current tenant">
          <div className="p-5">
            {!tenant ? (
              <EmptyState icon={Building2} title="No features" description="Feature information is unavailable." />
            ) : (
              <div className="flex flex-wrap gap-2">
                {featureList.length > 0 ? (
                  featureList.map((feature) => (
                    <Badge key={feature} variant="accent" className="text-xs">
                      {feature}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No advanced modules enabled.</span>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

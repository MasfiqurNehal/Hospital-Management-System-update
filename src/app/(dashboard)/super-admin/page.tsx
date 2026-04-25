'use client';

import { useEffect, useState } from 'react';
import { Building2, CreditCard, Shield, Users } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { tenantAPI } from '@/lib/mock-api';
import { formatDate } from '@/lib/utils';
import type { Tenant } from '@/types';

export default function SuperAdminDashboardPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const tenants = tenant ? [tenant] : [];

  useEffect(() => {
    tenantAPI.getCurrent().then((r) => setTenant(r.data));
  }, []);

  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const totalPatients = tenants.reduce((s, t) => s + t.usage.patient_count, 0);
  const totalBeds = tenants.reduce((s, t) => s + t.usage.bed_count, 0);
  const totalStaff = tenants.reduce((s, t) => s + t.usage.active_staff_count, 0);

  const planColors: Record<string, 'accent' | 'healthy' | 'borderline' | 'critical'> = {
    starter: 'accent',
    business: 'healthy',
    enterprise: 'borderline',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Super Admin — multi-tenant HMS platform management"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total Tenants" value={tenants.length} icon={Building2} accentColor="primary" />
        <KPICard label="Active Tenants" value={activeTenants} icon={Building2} accentColor="healthy" />
        <KPICard label="Total Patients" value={totalPatients.toLocaleString()} icon={Users} accentColor="accent" />
        <KPICard label="Active Staff" value={totalStaff} icon={Shield} accentColor="borderline" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total Beds (Platform)</div>
          <div className="mt-1 text-2xl font-bold">{totalBeds.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Platform Version</div>
          <div className="mt-1 text-2xl font-bold font-mono">v2026.1</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Uptime</div>
          <div className="mt-1 text-2xl font-bold text-healthy">99.98%</div>
        </div>
      </div>

      <SectionCard
        title="Tenant Registry"
        description={`${tenants.length} registered hospital${tenants.length !== 1 ? 's' : ''}`}
      >
        {tenants.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Building2} title="No tenants" description="No hospitals registered on the platform." />
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
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                          style={{ backgroundColor: t.branding.primary_color }}
                        >
                          {t.branding.hospital_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{t.branding.hospital_name}</div>
                          <div className="text-xs text-muted-foreground">{t.address.city}, {t.address.division}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <code className="rounded bg-secondary px-2 py-0.5 text-xs">{t.subdomain}.hms.com.bd</code>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={planColors[t.plan] ?? 'secondary'} className="capitalize">
                        {t.plan}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={t.status === 'active' ? 'healthy' : t.status === 'suspended' ? 'critical' : 'secondary'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{t.usage.patient_count.toLocaleString()}</td>
                    <td className="px-3 py-3 tabular-nums">{t.usage.bed_count}</td>
                    <td className="px-3 py-3 tabular-nums">{t.usage.active_staff_count}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {t.subscription_renews_at ? formatDate(t.subscription_renews_at) : 'Not set'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Platform Health" description="System metrics">
          <div className="p-5 space-y-3">
            {[
              { label: 'API Gateway', status: 'healthy', value: '< 120ms' },
              { label: 'Database Cluster', status: 'healthy', value: '99.99% uptime' },
              { label: 'HAS Alert Engine', status: 'healthy', value: 'All channels active' },
              { label: 'SMS Gateway (SSL Wireless)', status: 'healthy', value: 'Delivery: 99.1%' },
              { label: 'Email (SendGrid)', status: 'healthy', value: 'Delivery: 99.7%' },
              { label: 'Storage (S3)', status: 'healthy', value: '< 5% capacity' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.status === 'healthy' ? 'bg-healthy' : 'bg-critical pulse-critical'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.value}</span>
              </div>
            ))}
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
                  <div className="flex flex-wrap gap-1 justify-end">
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

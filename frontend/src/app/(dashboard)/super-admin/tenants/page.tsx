import { Building2 } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_TENANT } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

export default function SuperAdminTenantsPage() {
  const tenants = [MOCK_TENANT];

  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" description="Hospital tenant registry, plan limits, and operational usage." />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPICard label="Tenants" value={tenants.length} icon={Building2} />
        <KPICard label="Patients" value={MOCK_TENANT.usage.patient_count.toLocaleString()} icon={Building2} accentColor="accent" />
        <KPICard label="Beds" value={MOCK_TENANT.usage.bed_count} icon={Building2} accentColor="healthy" />
        <KPICard label="Branches" value={MOCK_TENANT.usage.branch_count} icon={Building2} accentColor="borderline" />
      </div>

      <SectionCard title="Tenant Registry" description="SRS Module 12">
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
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="font-medium">{tenant.branding.hospital_name}</div>
                    <div className="text-xs text-muted-foreground">{tenant.address.city}, {tenant.address.country}</div>
                  </td>
                  <td className="px-3 py-3"><code className="rounded bg-secondary px-2 py-0.5 text-xs">{tenant.subdomain}.hms.com.bd</code></td>
                  <td className="px-3 py-3"><Badge variant="healthy" className="capitalize">{tenant.plan}</Badge></td>
                  <td className="px-3 py-3"><Badge variant="healthy" className="capitalize">{tenant.status}</Badge></td>
                  <td className="px-3 py-3 text-muted-foreground">{tenant.usage.active_staff_count} staff, {tenant.usage.bed_count} beds</td>
                  <td className="px-3 py-3 text-muted-foreground">{tenant.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : 'Not set'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

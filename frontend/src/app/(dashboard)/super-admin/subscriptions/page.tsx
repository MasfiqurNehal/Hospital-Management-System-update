'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { tenantAPI } from '@/lib/mock-api';
import { formatDate } from '@/lib/utils';
import type { Tenant } from '@/types';

export default function SuperAdminSubscriptionsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    tenantAPI.getCurrent().then((r) => setTenant(r.data)).catch(() => setTenant(null));
  }, []);

  const featureFlags = useMemo(() => {
    if (!tenant) return [];

    return [
      tenant.limits.has_telemedicine && 'Telemedicine',
      tenant.limits.has_emergency_module && 'Emergency',
      tenant.limits.has_pharma_portal && 'Pharmacy',
      tenant.limits.has_white_label && 'White Label',
      tenant.limits.has_ai_features && 'AI Features',
    ].filter(Boolean) as string[];
  }, [tenant]);

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Live subscription state for the current tenant." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Current Plan" value={tenant?.plan ?? '—'} icon={CreditCard} accentColor="accent" />
        <KPICard label="Status" value={tenant?.status ?? '—'} icon={CreditCard} accentColor={tenant?.status === 'active' ? 'healthy' : 'borderline'} />
        <KPICard label="SLA" value={tenant ? `${tenant.limits.sla_response_hours}h` : '—'} icon={CreditCard} accentColor="borderline" />
        <KPICard label="Renewal" value={tenant?.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : 'Not set'} icon={CreditCard} accentColor="primary" />
      </div>

      <SectionCard title="Subscription Record" description="Current tenant billing and feature limits">
        <div className="p-5">
          {!tenant ? (
            <EmptyState icon={CreditCard} title="No subscription data" description="The tenant API did not return subscription details." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Tenant" value={tenant.branding.hospital_name} />
              <Info label="Domain" value={`${tenant.subdomain}.hms.com.bd`} />
              <Info label="Plan" value={tenant.plan} badge />
              <Info label="Status" value={tenant.status} badge />
              <Info label="Started" value={tenant.subscription_started_at ? formatDate(tenant.subscription_started_at) : 'Not set'} />
              <Info label="Renews" value={tenant.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : 'Not set'} />
              <Info label="Max Patients" value={tenant.limits.max_patients?.toLocaleString() ?? 'Unlimited'} />
              <Info label="Alert Channels" value={tenant.limits.alert_channels.map((channel) => channel.replace('_', ' ')).join(', ')} />
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Enabled Modules" description="Tenant capabilities available under the current plan">
        <div className="p-5">
          {!tenant ? (
            <EmptyState icon={CreditCard} title="No modules" description="Feature flags are unavailable until tenant data loads." />
          ) : featureFlags.length === 0 ? (
            <span className="text-sm text-muted-foreground">No advanced modules are enabled for this tenant.</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {featureFlags.map((flag) => (
                <Badge key={flag} variant="accent" className="text-xs">
                  {flag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function Info({ label, value, badge = false }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1">
        {badge ? (
          <Badge variant={label === 'Status' && value === 'active' ? 'healthy' : 'secondary'} className="capitalize">
            {value}
          </Badge>
        ) : (
          <span className="font-medium">{value}</span>
        )}
      </div>
    </div>
  );
}

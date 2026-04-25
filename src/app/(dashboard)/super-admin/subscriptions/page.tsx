import { CreditCard } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_TENANT } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

export default function SuperAdminSubscriptionsPage() {
  const monthlyAmount = 45000;

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="SaaS billing, renewal status, and enabled plan capabilities." />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPICard label="Active Subscriptions" value={1} icon={CreditCard} />
        <KPICard label="MRR" value={`Tk ${monthlyAmount.toLocaleString('en-BD')}`} icon={CreditCard} accentColor="healthy" />
        <KPICard label="Plan" value={MOCK_TENANT.plan} icon={CreditCard} accentColor="accent" />
        <KPICard label="SLA" value={`${MOCK_TENANT.limits.sla_response_hours}h`} icon={CreditCard} accentColor="borderline" />
      </div>

      <SectionCard title="Subscription Record" description="SRS Module 12">
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Tenant" value={MOCK_TENANT.branding.hospital_name} />
            <Info label="Status" value={MOCK_TENANT.status} badge />
            <Info label="Started" value={MOCK_TENANT.subscription_started_at ? formatDate(MOCK_TENANT.subscription_started_at) : 'Not set'} />
            <Info label="Renews" value={MOCK_TENANT.subscription_renews_at ? formatDate(MOCK_TENANT.subscription_renews_at) : 'Not set'} />
            <Info label="Max Patients" value={MOCK_TENANT.limits.max_patients?.toLocaleString() ?? 'Unlimited'} />
            <Info label="Alert Channels" value={MOCK_TENANT.limits.alert_channels.join(', ')} />
          </div>
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
        {badge ? <Badge variant="healthy" className="capitalize">{value}</Badge> : <span className="font-medium">{value}</span>}
      </div>
    </div>
  );
}

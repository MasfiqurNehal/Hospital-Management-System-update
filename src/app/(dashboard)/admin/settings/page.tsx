'use client';

import { useEffect, useState } from 'react';
import { Building2, Shield, Bell, CreditCard } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tenantAPI } from '@/lib/mock-api';
import { formatDate } from '@/lib/utils';
import type { Tenant } from '@/types';

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    tenantAPI.getCurrent().then((r) => setTenant(r.data));
  }, []);

  if (!tenant) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Hospital configuration and platform settings" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const channelLabels: Record<string, string> = {
    sms: 'SMS',
    email: 'Email',
    whatsapp: 'WhatsApp',
    in_app: 'In-App',
    push: 'Push',
    voice: 'Voice Call',
  };

  const planColors: Record<string, 'accent' | 'healthy' | 'borderline'> = {
    starter: 'accent',
    business: 'healthy',
    enterprise: 'borderline',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Hospital profile, subscription, and platform configuration"
        actions={
          <Button variant="outline" size="sm">
            Save Changes
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Plan"
          value={tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
          icon={CreditCard}
          accentColor="primary"
        />
        <KPICard label="Total Patients" value={tenant.usage.patient_count.toLocaleString()} icon={Shield} accentColor="accent" />
        <KPICard label="Total Beds" value={tenant.usage.bed_count} icon={Building2} accentColor="healthy" />
        <KPICard label="Active Staff" value={tenant.usage.active_staff_count} icon={Shield} accentColor="borderline" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Hospital Profile" description="Branding and contact information">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white"
                style={{ backgroundColor: tenant.branding.primary_color }}>
                {tenant.branding.hospital_name.charAt(0)}
              </div>
              <div>
                <div className="text-lg font-semibold">{tenant.branding.hospital_name}</div>
                <div className="text-sm text-muted-foreground">{tenant.branding.tagline}</div>
                <Badge variant={planColors[tenant.plan] ?? 'secondary'} className="mt-1 capitalize">
                  {tenant.plan} plan
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
              <SettingRow label="Subdomain" value={`${tenant.subdomain}.hms.com.bd`} mono />
              <SettingRow label="Status" value={<Badge variant={tenant.status === 'active' ? 'healthy' : 'destructive'}>{tenant.status}</Badge>} />
              <SettingRow label="Support Email" value={tenant.branding.support_email} />
              <SettingRow label="Support Phone" value={tenant.branding.support_phone} />
              <SettingRow label="Brand Color" value={
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: tenant.branding.primary_color }} />
                  <span className="font-mono text-xs">{tenant.branding.primary_color}</span>
                </div>
              } />
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</div>
              <div className="text-sm text-muted-foreground">
                {tenant.address.line1}{tenant.address.line2 ? `, ${tenant.address.line2}` : ''},{' '}
                {tenant.address.city}, {tenant.address.district}, {tenant.address.division} {tenant.address.postal_code}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Subscription & Limits" description="Current plan usage and feature access">
          <div className="p-5 space-y-4">
            <div className="grid gap-3">
              <LimitRow
                label="Patients"
                used={tenant.usage.patient_count}
                max={tenant.limits.max_patients}
              />
              <LimitRow
                label="Beds"
                used={tenant.usage.bed_count}
                max={tenant.limits.max_beds}
              />
              <LimitRow
                label="Branches"
                used={tenant.usage.branch_count}
                max={tenant.limits.max_branches}
              />
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Feature Access
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Telemedicine', enabled: tenant.limits.has_telemedicine },
                  { label: 'Emergency Module', enabled: tenant.limits.has_emergency_module },
                  { label: 'Pharma Portal', enabled: tenant.limits.has_pharma_portal },
                  { label: 'White Label', enabled: tenant.limits.has_white_label },
                  { label: 'AI Features', enabled: tenant.limits.has_ai_features },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between rounded-md bg-secondary/30 px-3 py-2">
                    <span className="text-xs font-medium">{f.label}</span>
                    <Badge variant={f.enabled ? 'healthy' : 'secondary'} className="text-[10px]">
                      {f.enabled ? 'Enabled' : 'Off'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Subscription
              </div>
              <div className="grid gap-2 text-sm">
                <SettingRow label="Started" value={tenant.subscription_started_at ? formatDate(tenant.subscription_started_at) : 'Not set'} />
                <SettingRow label="Renews" value={tenant.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : 'Not set'} />
                <SettingRow label="SLA Response" value={`${tenant.limits.sla_response_hours}h`} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Alert Channels (HAS)"
        description="Channels enabled for Hospital Alert System dispatch"
      >
        <div className="p-5">
          <div className="flex flex-wrap gap-3">
            {['sms', 'email', 'whatsapp', 'in_app', 'push', 'voice'].map((channel) => {
              const enabled = tenant.limits.alert_channels.includes(channel as never);
              return (
                <div
                  key={channel}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
                    enabled
                      ? 'border-healthy/30 bg-healthy/5 text-healthy'
                      : 'border-border bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  {channelLabels[channel]}
                  <Badge variant={enabled ? 'healthy' : 'secondary'} className="text-[10px]">
                    {enabled ? 'Active' : 'Off'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function SettingRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function LimitRow({ label, used, max }: { label: string; used: number; max: number | null }) {
  const pct = max ? Math.min((used / max) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {used.toLocaleString()} / {max ? max.toLocaleString() : '∞'}
        </span>
      </div>
      {max && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 90 ? 'bg-critical' : pct >= 75 ? 'bg-borderline' : 'bg-healthy'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_ALERTS } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';

export default function SuperAdminPlatformAlertsPage() {
  const critical = MOCK_ALERTS.filter((alert) => alert.severity === 'critical').length;
  const unacknowledged = MOCK_ALERTS.filter((alert) => !alert.acknowledged_at).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Alerts" description="Cross-tenant HAS delivery health and escalations." />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPICard label="Alerts" value={MOCK_ALERTS.length} icon={AlertTriangle} />
        <KPICard label="Critical" value={critical} icon={AlertTriangle} accentColor="critical" />
        <KPICard label="Unacknowledged" value={unacknowledged} icon={AlertTriangle} accentColor="borderline" />
        <KPICard label="Channels" value={4} icon={AlertTriangle} accentColor="accent" />
      </div>

      <SectionCard title="HAS Event Stream" description="SRS Module 1 and Module 13">
        <div className="divide-y divide-border">
          {MOCK_ALERTS.map((alert) => (
            <div key={alert.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{alert.title}</div>
                  <div className="text-sm text-muted-foreground">{alert.message}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(alert.triggered_at)}</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'borderline' : 'accent'}>{alert.severity}</Badge>
                  <Badge variant={alert.acknowledged_at ? 'healthy' : 'warning'}>{alert.acknowledged_at ? 'acknowledged' : 'open'}</Badge>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {alert.channels.map((channel) => (
                  <Badge key={channel} variant="secondary" className="capitalize">{channel.replace('_', ' ')}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

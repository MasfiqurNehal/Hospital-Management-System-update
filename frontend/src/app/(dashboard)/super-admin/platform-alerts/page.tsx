"use client";

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { alertAPI } from '@/lib/mock-api';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import type { Alert, AlertSeverity } from '@/types';

export default function SuperAdminPlatformAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selected, setSelected] = useState<Alert | null>(null);
  const [filter, setFilter] = useState<'all' | AlertSeverity>('all');

  useEffect(() => {
    alertAPI.list().then((r) => {
      const sorted = [...r.data].sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime());
      setAlerts(sorted);
      setSelected(sorted[0] ?? null);
    }).catch(() => {
      setAlerts([]);
      setSelected(null);
    });
  }, []);

  const filteredAlerts = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((alert) => alert.severity === filter)),
    [alerts, filter],
  );

  const critical = alerts.filter((alert) => alert.severity === 'critical').length;
  const unacknowledged = alerts.filter((alert) => !alert.acknowledged_at).length;

  async function acknowledgeSelected(alert: Alert) {
    if (alert.acknowledged_at) return;

    setAlerts((prev) => prev.map((item) => (item.id === alert.id ? { ...item, acknowledged_at: new Date().toISOString() } : item)));
    setSelected((current) => (current?.id === alert.id ? { ...alert, acknowledged_at: new Date().toISOString() } : current));

    try {
      await alertAPI.acknowledge(alert.id);
    } catch {
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? { ...item, acknowledged_at: undefined } : item)));
      setSelected((current) => (current?.id === alert.id ? { ...alert, acknowledged_at: undefined } : current));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Alerts" description="Live HAS alerts and cross-tenant escalations." />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPICard label="Alerts" value={alerts.length} icon={AlertTriangle} />
        <KPICard label="Critical" value={critical} icon={AlertTriangle} accentColor="critical" />
        <KPICard label="Unacknowledged" value={unacknowledged} icon={AlertTriangle} accentColor="borderline" />
        <KPICard label="Visible" value={filteredAlerts.length} icon={AlertTriangle} accentColor="accent" />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map((severity) => (
          <button
            key={severity}
            type="button"
            onClick={() => setFilter(severity)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === severity ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary',
            )}
          >
            {severity === 'all' ? 'All' : severity}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard title="HAS Event Stream" description="Live cross-tenant alerts from the backend">
          <div className="max-h-[640px] divide-y divide-border overflow-y-auto scrollbar-slim">
            {filteredAlerts.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={AlertTriangle} title="No alerts" description="No alerts match the selected filter." />
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => setSelected(alert)}
                  className={cn(
                    'flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/30',
                    selected?.id === alert.id && 'bg-primary/5 ring-1 ring-inset ring-primary/20',
                  )}
                >
                  <div className={cn('mt-1 h-3 w-3 shrink-0 rounded-full', alert.severity === 'critical' ? 'bg-critical' : alert.severity === 'high' ? 'bg-orange-500' : 'bg-borderline')} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{alert.title}</div>
                      {!alert.acknowledged_at && <span className="rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold uppercase text-destructive">New</span>}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{alert.message}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'warning' : 'secondary'} className="text-[10px] capitalize">
                        {alert.severity}
                      </Badge>
                      <span>{formatRelative(alert.triggered_at)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Alert Details"
          description={selected ? selected.trigger_type.replace(/_/g, ' ') : 'Select an alert'}
          action={selected && !selected.acknowledged_at ? <Button size="sm" onClick={() => void acknowledgeSelected(selected)}><Check className="h-4 w-4" /> Acknowledge</Button> : undefined}
        >
          {!selected ? (
            <div className="p-6">
              <EmptyState icon={AlertTriangle} title="No alert selected" description="Choose an alert from the stream to inspect it." />
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div className={cn('rounded-lg border-l-4 bg-secondary/30 p-4', selected.severity === 'critical' && 'border-critical bg-critical/5', selected.severity === 'high' && 'border-orange-500 bg-orange-500/5') }>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={selected.severity === 'critical' ? 'critical' : selected.severity === 'high' ? 'warning' : 'secondary'}>
                    {selected.severity}
                  </Badge>
                  <div className="text-xs text-muted-foreground">Triggered {formatDateTime(selected.triggered_at)}</div>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{selected.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{selected.message}</p>
              </div>

              {selected.patient_name && (
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Patient</div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="font-medium">{selected.patient_name}</div>
                    <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">{selected.patient_mrn}</code>
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Channels</div>
                <div className="flex flex-wrap gap-2">
                  {selected.channels.map((channel) => (
                    <Badge key={channel} variant="secondary" className="capitalize">{channel.replace('_', ' ')}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Recipients</div>
                <div className="space-y-2">
                  {selected.recipients.map((recipient) => (
                    <div key={`${recipient.user_id}-${recipient.contact}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div>
                        <div className="text-sm font-medium">{recipient.user_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{recipient.role.replace('_', ' ')} · {recipient.contact}</div>
                      </div>
                      <Badge variant={recipient.acknowledged ? 'healthy' : 'warning'}>{recipient.acknowledged ? 'Acknowledged' : 'Pending'}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Dispatch Log</div>
                <div className="space-y-2">
                  {selected.dispatch_attempts.map((attempt, index) => (
                    <div key={`${attempt.channel}-${index}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div>
                        <div className="text-sm font-medium capitalize">{attempt.channel}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(attempt.attempted_at)}</div>
                      </div>
                      <Badge variant={attempt.status === 'success' ? 'healthy' : attempt.status === 'retrying' ? 'warning' : 'destructive'}>
                        {attempt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </SectionCard>
    </div>
  );
}

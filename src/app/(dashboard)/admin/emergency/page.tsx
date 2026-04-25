'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Ambulance, MapPin, Phone } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, KPICard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { emergencyAPI } from '@/lib/mock-api';
import { formatDateTime, formatRelative, cn } from '@/lib/utils';
import type { EmergencyRequest, EmergencyStatus } from '@/types';

export default function EmergencyPage() {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [selected, setSelected] = useState<EmergencyRequest | null>(null);

  useEffect(() => {
    emergencyAPI.listActive().then((r) => {
      setEmergencies(r.data);
      if (r.data.length > 0) setSelected(r.data[0]);
    });
  }, []);

  const critical = emergencies.filter((e) => e.priority === 'critical' || e.priority === 'high').length;

  function priorityVariant(priority: EmergencyRequest['priority']) {
    switch (priority) {
      case 'critical': return 'critical';
      case 'high': return 'warning';
      case 'medium': return 'borderline';
      default: return 'secondary';
    }
  }

  function statusVariant(status: EmergencyStatus) {
    switch (status) {
      case 'sos_received': return 'critical';
      case 'dispatcher_assigned':
      case 'ambulance_assigned': return 'warning';
      case 'en_route_to_patient':
      case 'at_patient_location':
      case 'transporting': return 'accent';
      case 'arrived_at_er':
      case 'handed_over': return 'healthy';
      default: return 'secondary';
    }
  }

  function statusLabel(status: EmergencyStatus) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const timeline = selected
    ? [
        { label: 'SOS Received', time: selected.sos_received_at, done: true },
        { label: 'Dispatcher Assigned', time: selected.dispatcher_assigned_at, done: !!selected.dispatcher_assigned_at },
        { label: 'Ambulance Assigned', time: selected.ambulance_assigned_at, done: !!selected.ambulance_assigned_at },
        { label: 'En Route to Patient', time: selected.ambulance_dispatched_at, done: !!selected.ambulance_dispatched_at },
        { label: 'At Patient Location', time: selected.arrived_at_patient_at, done: !!selected.arrived_at_patient_at },
        { label: 'Transporting to ER', time: selected.left_patient_location_at, done: !!selected.left_patient_location_at },
        { label: 'Arrived at ER', time: selected.arrived_at_er_at, done: !!selected.arrived_at_er_at },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency & Ambulance"
        description="Active emergency requests and dispatch management"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Active Emergencies" value={emergencies.length} icon={AlertTriangle} accentColor="critical" />
        <KPICard label="High Priority" value={critical} icon={Ambulance} accentColor="borderline" />
        <KPICard label="ER Pre-notified" value={emergencies.filter((e) => e.er_pre_notification_sent).length} icon={Phone} accentColor="healthy" />
      </div>

      {emergencies.length === 0 ? (
        <SectionCard title="Active Emergencies">
          <div className="p-6">
            <EmptyState
              icon={Ambulance}
              title="No active emergencies"
              description="All clear — no active emergency requests at this time."
            />
          </div>
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Active Requests" description={`${emergencies.length} active`} className="lg:col-span-1">
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-slim">
              {emergencies.map((emr) => (
                <div
                  key={emr.id}
                  onClick={() => setSelected(emr)}
                  className={cn(
                    'cursor-pointer px-4 py-3 hover:bg-secondary/30 transition-colors',
                    selected?.id === emr.id && 'bg-secondary/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{emr.patient_name}</div>
                      <code className="text-[11px] text-muted-foreground">{emr.request_number}</code>
                    </div>
                    <Badge variant={priorityVariant(emr.priority)} className="shrink-0 text-[10px]">
                      {emr.priority}
                    </Badge>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{emr.chief_complaint}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {formatRelative(emr.sos_received_at)}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Emergency Details" className="lg:col-span-2">
            {!selected ? (
              <div className="p-6">
                <EmptyState icon={Ambulance} title="Select an emergency" description="Click a request on the left." />
              </div>
            ) : (
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{selected.patient_name}</h3>
                      <Badge variant={priorityVariant(selected.priority)} className="capitalize">
                        {selected.priority} priority
                      </Badge>
                    </div>
                    <code className="text-xs text-muted-foreground">{selected.request_number}</code>
                  </div>
                  <Badge variant={statusVariant(selected.status)}>
                    {statusLabel(selected.status)}
                  </Badge>
                </div>

                <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Chief Complaint
                  </div>
                  <p className="text-sm">{selected.chief_complaint}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Requester" value={selected.requester_name ?? selected.patient_name} />
                  <InfoBlock label="Contact" value={`+${selected.patient_phone.country_code} ${selected.patient_phone.number}`} />
                  {selected.pickup_location.address && (
                    <InfoBlock label="Pickup Location" value={selected.pickup_location.address} />
                  )}
                  {selected.ambulance_number && (
                    <InfoBlock label="Ambulance" value={selected.ambulance_number} />
                  )}
                  {selected.dispatcher_name && (
                    <InfoBlock label="Dispatcher" value={selected.dispatcher_name} />
                  )}
                  {selected.destination_hospital_name && (
                    <InfoBlock label="Destination" value={selected.destination_hospital_name} />
                  )}
                  {selected.estimated_arrival_time && (
                    <InfoBlock label="ETA" value={formatDateTime(selected.estimated_arrival_time)} />
                  )}
                </div>

                {selected.reported_vitals && (
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Reported Vitals
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {selected.reported_vitals.consciousness && (
                        <span>
                          <span className="text-muted-foreground">Consciousness:</span>{' '}
                          <span className="capitalize">{selected.reported_vitals.consciousness}</span>
                        </span>
                      )}
                      {selected.reported_vitals.breathing && (
                        <span>
                          <span className="text-muted-foreground">Breathing:</span>{' '}
                          <span className="capitalize">{selected.reported_vitals.breathing}</span>
                        </span>
                      )}
                      {selected.reported_vitals.bleeding && (
                        <span>
                          <span className="text-muted-foreground">Bleeding:</span>{' '}
                          <span className={cn(
                            'capitalize font-medium',
                            selected.reported_vitals.bleeding === 'severe' ? 'text-critical' :
                            selected.reported_vitals.bleeding === 'minor' ? 'text-borderline' : 'text-foreground',
                          )}>
                            {selected.reported_vitals.bleeding}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status Timeline
                  </div>
                  <div className="space-y-3">
                    {timeline.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center',
                            step.done
                              ? 'border-healthy bg-healthy/20'
                              : 'border-border bg-secondary',
                          )}
                        >
                          {step.done && (
                            <div className="h-2 w-2 rounded-full bg-healthy" />
                          )}
                        </div>
                        <div>
                          <div className={cn('text-sm font-medium', step.done ? 'text-foreground' : 'text-muted-foreground')}>
                            {step.label}
                          </div>
                          {step.time && (
                            <div className="text-xs text-muted-foreground">{formatDateTime(step.time)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.er_pre_notification_sent && (
                  <div className="rounded-md bg-healthy/10 px-3 py-2 text-sm text-healthy">
                    ER pre-notification sent
                    {selected.er_pre_notification_sent_at && (
                      <span className="ml-2 text-xs opacity-70">
                        at {formatDateTime(selected.er_pre_notification_sent_at)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}

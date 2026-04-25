'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, Calendar, ClipboardList, FlaskConical, Heart } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import {
  appointmentAPI,
  prescriptionAPI,
  labAPI,
  billingAPI,
  patientAPI,
  emergencyAPI,
} from '@/lib/mock-api';
import { formatDate, formatDateTime, formatBDT, formatRelative } from '@/lib/utils';
import type { Appointment, Prescription, LabTest, Bill, HealthTimelineEvent } from '@/types';

export default function PatientDashboardPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [timeline, setTimeline] = useState<HealthTimelineEvent[]>([]);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosSending, setSosSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    const patientUserId = 'patient-001';
    appointmentAPI.list({ patient_id: patientUserId }).then((r) => setAppointments(r.data));
    prescriptionAPI.list({ patient_id: patientUserId }).then((r) => setPrescriptions(r.data));
    labAPI.list({ patient_id: patientUserId }).then((r) => setLabTests(r.data));
    billingAPI.list({ patient_id: patientUserId }).then((r) => setBills(r.data));
    patientAPI.getHealthTimeline(patientUserId).then((r) => setTimeline(r.data));
  }, [user]);

  const upcomingAppointments = appointments.filter((a) =>
    ['scheduled', 'confirmed'].includes(a.status) && new Date(a.scheduled_at) >= new Date(),
  );
  const outstandingBalance = bills.reduce((s, b) => s + b.amount_outstanding_bdt, 0);
  const criticalLabResults = labTests.filter((t) => t.overall_flag === 'critical').length;

  async function triggerSOS() {
    setSosSending(true);
    try {
      await emergencyAPI.triggerSOS();
      setSosTriggered(true);
    } finally {
      setSosSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.full_name?.split(' ')[0] ?? 'Patient'}`}
        description="Your personal health dashboard"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Upcoming Appointments" value={upcomingAppointments.length} icon={Calendar} accentColor="primary" />
        <KPICard label="Active Prescriptions" value={prescriptions.filter((rx) => rx.status === 'signed').length} icon={ClipboardList} accentColor="accent" />
        <KPICard label="Lab Results" value={labTests.length} icon={FlaskConical} accentColor="borderline" />
        <KPICard label="Outstanding Balance" value={formatBDT(outstandingBalance)} icon={Activity} accentColor={outstandingBalance > 0 ? 'critical' : 'healthy'} />
      </div>

      <div
        className={`relative flex items-center gap-4 rounded-xl border-2 p-5 transition-all ${
          sosTriggered
            ? 'border-healthy/50 bg-healthy/5'
            : 'border-critical/30 bg-critical/5'
        }`}
      >
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${sosTriggered ? 'bg-healthy' : 'bg-critical pulse-critical'}`}>
          <AlertTriangle className="h-7 w-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-lg font-bold ${sosTriggered ? 'text-healthy' : 'text-critical'}`}>
            {sosTriggered ? 'Emergency Dispatched!' : 'Emergency SOS'}
          </div>
          <div className="text-sm text-muted-foreground">
            {sosTriggered
              ? 'An ambulance has been dispatched to your location. Stay calm.'
              : 'Press the button to alert emergency services and dispatch an ambulance.'}
          </div>
        </div>
        {!sosTriggered ? (
          <Button
            variant="destructive"
            size="lg"
            loading={sosSending}
            onClick={triggerSOS}
            className="shrink-0 font-bold tracking-wide"
          >
            {!sosSending && <AlertTriangle className="h-5 w-5" />}
            SOS
          </Button>
        ) : (
          <Badge variant="healthy" className="shrink-0 text-sm px-4 py-2">Dispatched</Badge>
        )}
      </div>

      {criticalLabResults > 0 && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-critical/30 bg-critical/5 px-4 py-3">
          <FlaskConical className="h-5 w-5 shrink-0 text-critical" />
          <div className="text-sm font-semibold text-critical">
            {criticalLabResults} critical lab result{criticalLabResults > 1 ? 's' : ''} — please consult your doctor.
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Upcoming Appointments"
          description={`${upcomingAppointments.length} scheduled`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/patient/appointments">View all</Link>
            </Button>
          }
        >
          {upcomingAppointments.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Calendar} title="No upcoming appointments" description="You have no scheduled appointments." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcomingAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
                  <div className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-center">
                    <div className="text-sm font-bold text-primary">{formatDate(a.scheduled_at).split('/')[0]}</div>
                    <div className="text-[10px] text-primary/70">{formatDate(a.scheduled_at).split('/').slice(1).join('/')}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{a.doctor_name}</div>
                    <div className="text-xs text-muted-foreground">{a.doctor_specialty} · {a.reason}</div>
                  </div>
                  <Badge variant={a.status === 'confirmed' ? 'healthy' : 'secondary'} className="capitalize">
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Prescriptions"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/patient/prescriptions">View all</Link>
            </Button>
          }
        >
          {prescriptions.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ClipboardList} title="No prescriptions" description="Your prescriptions will appear here." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {prescriptions.slice(0, 4).map((rx) => (
                <div key={rx.id} className="px-4 py-3 hover:bg-secondary/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{rx.diagnosis}</div>
                      <div className="text-xs text-muted-foreground">
                        {rx.doctor_name} · {rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Badge
                      variant={
                        rx.status === 'dispensed_full' ? 'healthy'
                        : rx.status === 'dispensed_partial' ? 'warning'
                        : rx.status === 'signed' ? 'accent'
                        : 'secondary'
                      }
                      className="capitalize shrink-0 text-[10px]"
                    >
                      {rx.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {rx.follow_up_date && (
                    <div className="mt-1 text-xs text-accent">
                      Follow-up: {formatDate(rx.follow_up_date)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Health Timeline"
        description="Your complete medical history"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/patient/timeline">Full timeline</Link>
          </Button>
        }
      >
        {timeline.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Heart} title="No health events" description="Your health history will appear here." />
          </div>
        ) : (
          <div className="p-5">
            <div className="space-y-4">
              {timeline.map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      event.event_type === 'appointment' ? 'bg-primary/10 text-primary'
                      : event.event_type === 'prescription' ? 'bg-accent/10 text-accent'
                      : event.event_type === 'lab_test' ? 'bg-borderline/10 text-borderline'
                      : 'bg-secondary text-muted-foreground'
                    }`}>
                      {event.event_type === 'appointment' ? <Calendar className="h-4 w-4" />
                        : event.event_type === 'prescription' ? <ClipboardList className="h-4 w-4" />
                        : event.event_type === 'lab_test' ? <FlaskConical className="h-4 w-4" />
                        : <Activity className="h-4 w-4" />}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="mt-1 h-full w-0.5 bg-border" />
                    )}
                  </div>
                  <div className="pb-4 min-w-0">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.description}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {event.doctor_name && <span>{event.doctor_name}</span>}
                      <span>·</span>
                      <span>{formatRelative(event.event_date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Billing & Payments"
        description={outstandingBalance > 0 ? `${formatBDT(outstandingBalance)} outstanding` : 'All paid'}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/patient/bills">View bills</Link>
          </Button>
        }
      >
        {bills.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Activity} title="No bills" description="Your bills will appear here." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {bills.slice(0, 3).map((bill) => (
              <div key={bill.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                      {bill.bill_number}
                    </code>
                    <span className="text-xs text-muted-foreground">{formatDate(bill.bill_date)}</span>
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {bill.line_items.length} item{bill.line_items.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-semibold tabular-nums">{formatBDT(bill.total_amount_bdt)}</div>
                  {bill.amount_outstanding_bdt > 0 && (
                    <div className="text-xs text-critical">Due: {formatBDT(bill.amount_outstanding_bdt)}</div>
                  )}
                </div>
                <Badge
                  variant={
                    bill.status === 'paid' ? 'healthy'
                    : bill.status === 'partial' ? 'warning'
                    : bill.status === 'cancelled' ? 'destructive'
                    : 'secondary'
                  }
                  className="shrink-0"
                >
                  {bill.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

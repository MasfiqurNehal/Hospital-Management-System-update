'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ClipboardList, Users, Video } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { appointmentAPI, prescriptionAPI } from '@/lib/mock-api';
import { useAuthStore } from '@/lib/auth-store';
import { formatTime, formatDate, formatRelative } from '@/lib/utils';
import type { Appointment, Prescription } from '@/types';

export default function DoctorDashboardPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    if (!user) return;
    appointmentAPI.list({ doctor_id: user.id }).then((r) => setAppointments(r.data));
    prescriptionAPI.list({ doctor_id: user.id }).then((r) => setPrescriptions(r.data));
  }, [user]);

  const todayAppointments = appointments.filter((a) => {
    const today = new Date().toDateString();
    return new Date(a.scheduled_at).toDateString() === today;
  });

  const pendingAppointments = todayAppointments.filter((a) =>
    ['scheduled', 'confirmed', 'checked_in'].includes(a.status),
  );
  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length;
  const pendingRx = prescriptions.filter((rx) => rx.status === 'signed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.full_name ?? 'Doctor'}`}
        description={user?.doctor_profile?.specialty ? `${user.doctor_profile.specialty} · ${user.doctor_profile.qualifications?.join(', ')}` : 'Your clinical workspace'}
        actions={
          <Button asChild size="sm">
            <Link href="/doctor/appointments">View All Appointments</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Today's Appointments" value={todayAppointments.length} icon={Calendar} accentColor="primary" />
        <KPICard label="Pending / Waiting" value={pendingAppointments.length} icon={Users} accentColor="borderline" />
        <KPICard label="Completed Today" value={completedToday} icon={Calendar} accentColor="healthy" />
        <KPICard label="Pending Prescriptions" value={pendingRx} icon={ClipboardList} accentColor="accent" />
      </div>

      {user?.doctor_profile && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">BMDC No.</div>
            <div className="mt-1 font-mono font-semibold">{user.doctor_profile.bmdc_number}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Consultation Fee</div>
            <div className="mt-1 font-semibold">৳{user.doctor_profile.consultation_fee_bdt?.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Experience</div>
            <div className="mt-1 font-semibold">{user.doctor_profile.years_of_experience} years</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Today's Queue"
          description={`${todayAppointments.length} scheduled`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/doctor/appointments">Full list</Link>
            </Button>
          }
        >
          {todayAppointments.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Calendar} title="No appointments today" description="Your schedule is clear for today." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {todayAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
                  <div className="shrink-0 text-center w-14">
                    <div className="text-base font-bold tabular-nums">{formatTime(a.scheduled_at).split(' ')[0]}</div>
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {formatTime(a.scheduled_at).split(' ')[1]}
                    </div>
                  </div>
                  <Avatar name={a.patient_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{a.patient_name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{a.patient_mrn}</span> · {a.reason}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {a.appointment_type === 'teleconsultation' && (
                      <Video className="h-4 w-4 text-accent" />
                    )}
                    <Badge
                      variant={
                        a.status === 'completed' ? 'healthy'
                        : a.status === 'checked_in' || a.status === 'in_progress' ? 'accent'
                        : 'secondary'
                      }
                      className="capitalize"
                    >
                      {a.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Prescriptions"
          description={`${prescriptions.length} total`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/doctor/prescriptions">View all</Link>
            </Button>
          }
        >
          {prescriptions.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ClipboardList} title="No prescriptions" description="You have not written any prescriptions yet." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {prescriptions.slice(0, 5).map((rx) => (
                <div key={rx.id} className="px-4 py-3 hover:bg-secondary/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{rx.patient_name}</div>
                      <div className="text-xs text-muted-foreground">{rx.diagnosis}</div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge
                        variant={
                          rx.status === 'dispensed_full' ? 'healthy'
                          : rx.status === 'dispensed_partial' ? 'warning'
                          : rx.status === 'signed' ? 'accent'
                          : 'secondary'
                        }
                        className="text-[10px] capitalize"
                      >
                        {rx.status.replace(/_/g, ' ')}
                      </Badge>
                      <code className="text-[10px] text-muted-foreground">{rx.prescription_number}</code>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}
                    {rx.signed_at && ` · ${formatRelative(rx.signed_at)}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

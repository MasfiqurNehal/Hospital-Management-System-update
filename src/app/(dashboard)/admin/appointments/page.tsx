'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Search, Video, X } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { appointmentAPI, userAPI } from '@/lib/mock-api';
import { formatDate, formatTime } from '@/lib/utils';
import type { Appointment, AppointmentStatus, AppointmentType, User } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [search, setSearch] = useState('');
  const [showBook, setShowBook] = useState(false);

  useEffect(() => {
    appointmentAPI.list().then((r) => setAppointments(r.data));
  }, []);

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      a.patient_name.toLowerCase().includes(q) ||
      a.patient_mrn.toLowerCase().includes(q) ||
      a.doctor_name.toLowerCase().includes(q) ||
      a.appointment_number.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const statuses: Array<{ value: 'all' | AppointmentStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={`${appointments.length} total appointments`}
        actions={
          <Button onClick={() => setShowBook(true)}>
            <Plus className="h-4 w-4" /> Book Appointment
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by patient, MRN, doctor, or appointment#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === s.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-secondary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <SectionCard
        title="Appointment List"
        description={`Showing ${filtered.length} of ${appointments.length}`}
      >
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Calendar}
              title="No appointments found"
              description="Try adjusting your search or filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Appt #</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Doctor</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Date & Time</th>
                  <th className="px-3 py-3">Fee</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {a.appointment_type === 'teleconsultation' && (
                          <Video className="h-3.5 w-3.5 shrink-0 text-accent" />
                        )}
                        <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                          {a.appointment_number}
                        </code>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={a.patient_name} size="sm" />
                        <div>
                          <div className="font-medium">{a.patient_name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{a.patient_mrn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{a.doctor_name}</div>
                      <div className="text-xs text-muted-foreground">{a.doctor_specialty}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary" className="text-[11px] capitalize">
                        {a.appointment_type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{formatTime(a.scheduled_at)}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(a.scheduled_at)}</div>
                    </td>
                    <td className="px-3 py-3 tabular-nums font-medium">৳{a.fee_bdt.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          a.payment_status === 'paid'
                            ? 'healthy'
                            : a.payment_status === 'waived'
                            ? 'secondary'
                            : 'warning'
                        }
                      >
                        {a.payment_status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          a.status === 'completed'
                            ? 'healthy'
                            : a.status === 'checked_in' || a.status === 'in_progress'
                            ? 'accent'
                            : a.status === 'confirmed'
                            ? 'default'
                            : a.status === 'cancelled' || a.status === 'no_show'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {a.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showBook && (
        <BookAppointmentModal
          onClose={() => setShowBook(false)}
          onSaved={(a) => setAppointments([a, ...appointments])}
        />
      )}
    </div>
  );
}

function BookAppointmentModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (a: Appointment) => void;
}) {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [form, setForm] = useState({
    patient_name: '',
    patient_mrn: '',
    patient_phone: '',
    doctor_id: '',
    appointment_type: 'consultation' as AppointmentType,
    date: '',
    time: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userAPI.listDoctors().then((r) => setDoctors(r.data));
  }, []);

  const selectedDoctor = doctors.find((d) => d.id === form.doctor_id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      tenant_id: 'tenant-001',
      appointment_number: `APT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      patient_id: `patient-${Date.now()}`,
      patient_mrn: form.patient_mrn || 'HAX-XXXXX',
      patient_name: form.patient_name,
      patient_phone: `+880 ${form.patient_phone}`,
      doctor_id: form.doctor_id,
      doctor_name: selectedDoctor?.full_name ?? '',
      doctor_specialty: selectedDoctor?.doctor_profile?.specialty ?? '',
      appointment_type: form.appointment_type,
      status: 'scheduled',
      source: 'phone',
      scheduled_at: `${form.date}T${form.time}:00Z`,
      duration_minutes: 30,
      reason: form.reason,
      fee_bdt: selectedDoctor?.doctor_profile?.consultation_fee_bdt ?? 1000,
      payment_status: 'pending',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSaving(false);
    onSaved(newAppt);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-slim rounded-xl border border-border bg-card shadow-elevated animate-fade-up">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">Book Appointment</h3>
            <p className="text-xs text-muted-foreground">Schedule a new patient appointment.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <FormSection title="Patient Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Patient Name" required>
                <Input
                  required
                  placeholder="Full name"
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                />
              </Field>
              <Field label="MRN (if registered)">
                <Input
                  placeholder="HAX-XXXXX"
                  className="font-mono"
                  value={form.patient_mrn}
                  onChange={(e) => setForm({ ...form, patient_mrn: e.target.value })}
                />
              </Field>
              <Field label="Phone" required>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-md border border-input bg-secondary px-3 text-sm font-medium">
                    +880
                  </div>
                  <Input
                    required
                    placeholder="1712345678"
                    value={form.patient_phone}
                    onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                  />
                </div>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Appointment Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Doctor" required>
                <select
                  required
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} — {d.doctor_profile?.specialty}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Type" required>
                <select
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.appointment_type}
                  onChange={(e) => setForm({ ...form, appointment_type: e.target.value as AppointmentType })}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="teleconsultation">Teleconsultation</option>
                  <option value="procedure">Procedure</option>
                </select>
              </Field>
              <Field label="Date" required>
                <Input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label="Time" required>
                <Input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Field>
              <Field label="Chief Complaint / Reason" required className="sm:col-span-2">
                <Input
                  required
                  placeholder="e.g. Chest pain, routine check-up…"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </Field>
            </div>
          </FormSection>

          {selectedDoctor && (
            <div className="rounded-lg bg-secondary/50 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Consultation fee: </span>
              <span className="font-semibold">
                ৳{selectedDoctor.doctor_profile?.consultation_fee_bdt?.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {!saving && <Calendar className="h-4 w-4" />} Book Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

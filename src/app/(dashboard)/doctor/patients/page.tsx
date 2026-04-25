import { Users } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS } from '@/lib/mock-data';
import { formatBDT, formatDate, formatPhone } from '@/lib/utils';

const doctorId = 'user-doc-001';

export default function DoctorPatientsPage() {
  const patientIds = new Set(MOCK_APPOINTMENTS.filter((a) => a.doctor_id === doctorId).map((a) => a.patient_id));
  const patients = MOCK_PATIENTS.filter((patient) => patientIds.has(patient.id));
  const outstanding = patients.reduce((sum, patient) => sum + (patient.outstanding_balance_bdt ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="My Patients" description="Patients connected to your appointments and clinical records." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Patients" value={patients.length} icon={Users} />
        <KPICard label="Total Visits" value={patients.reduce((sum, patient) => sum + (patient.total_visits ?? 0), 0)} icon={Users} accentColor="accent" />
        <KPICard label="Outstanding" value={formatBDT(outstanding)} icon={Users} accentColor={outstanding > 0 ? 'critical' : 'healthy'} />
      </div>

      <SectionCard title="Patient Panel" description="SRS Module 2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Patient</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Blood</th>
                <th className="px-3 py-3">Conditions</th>
                <th className="px-3 py-3">Last Visit</th>
                <th className="px-3 py-3">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="font-medium">{patient.full_name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{patient.mrn}</div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatPhone(patient.phone)}</td>
                  <td className="px-3 py-3">{patient.blood_group ?? 'Not set'}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {patient.medical_history.chronic_conditions.length > 0
                        ? patient.medical_history.chronic_conditions.map((condition) => <Badge key={condition} variant="secondary">{condition}</Badge>)
                        : <span className="text-muted-foreground">None</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{patient.last_visit_date ? formatDate(patient.last_visit_date) : 'No visits'}</td>
                  <td className="px-3 py-3 tabular-nums">{formatBDT(patient.outstanding_balance_bdt ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

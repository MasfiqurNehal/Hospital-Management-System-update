import { ClipboardList } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_PRESCRIPTIONS } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

const doctorId = 'user-doc-001';

export default function DoctorPrescriptionsPage() {
  const prescriptions = MOCK_PRESCRIPTIONS.filter((rx) => rx.doctor_id === doctorId);
  const medicines = prescriptions.reduce((sum, rx) => sum + rx.medicines.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Digital Prescriptions" description="Signed prescriptions, medicine instructions, and follow-up reminders." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Prescriptions" value={prescriptions.length} icon={ClipboardList} />
        <KPICard label="Medicines Ordered" value={medicines} icon={ClipboardList} accentColor="accent" />
        <KPICard label="Follow-ups Set" value={prescriptions.filter((rx) => rx.follow_up_reminder_set).length} icon={ClipboardList} accentColor="healthy" />
      </div>

      <SectionCard title="Recent Prescriptions" description="SRS Module 4">
        <div className="divide-y divide-border">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{rx.patient_name}</div>
                  <div className="text-sm text-muted-foreground">{rx.diagnosis} ({rx.diagnosis_icd10 ?? 'No ICD-10'})</div>
                  <code className="text-xs text-muted-foreground">{rx.prescription_number}</code>
                </div>
                <Badge variant={rx.status === 'dispensed_full' ? 'healthy' : 'accent'} className="capitalize">
                  {rx.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {rx.medicines.map((medicine) => (
                  <div key={`${rx.id}-${medicine.medicine_id}`} className="rounded-lg bg-secondary/30 px-3 py-2 text-sm">
                    <div className="font-medium">{medicine.brand_name} {medicine.strength}</div>
                    <div className="text-xs text-muted-foreground">
                      {medicine.dosage}, {medicine.frequency.replace(/_/g, ' ')}, {medicine.duration_days} days
                    </div>
                  </div>
                ))}
              </div>
              {rx.follow_up_date && <div className="mt-3 text-xs text-accent">Follow-up: {formatDate(rx.follow_up_date)}</div>}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

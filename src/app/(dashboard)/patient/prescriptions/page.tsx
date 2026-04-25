import { FileText } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_PRESCRIPTIONS } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

const patientId = 'patient-001';

export default function PatientPrescriptionsPage() {
  const prescriptions = MOCK_PRESCRIPTIONS.filter((prescription) => prescription.patient_id === patientId);

  return (
    <div className="space-y-6">
      <PageHeader title="My Prescriptions" description="Doctor-signed medication plans and follow-up instructions." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Prescriptions" value={prescriptions.length} icon={FileText} />
        <KPICard label="Medicines" value={prescriptions.reduce((sum, prescription) => sum + prescription.medicines.length, 0)} icon={FileText} accentColor="accent" />
        <KPICard label="Follow-ups" value={prescriptions.filter((prescription) => prescription.follow_up_date).length} icon={FileText} accentColor="healthy" />
      </div>

      <SectionCard title="Medication History" description="SRS Module 4">
        <div className="divide-y divide-border">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{prescription.diagnosis}</div>
                  <div className="text-sm text-muted-foreground">{prescription.doctor_name}</div>
                  <code className="text-xs text-muted-foreground">{prescription.prescription_number}</code>
                </div>
                <Badge variant={prescription.status === 'dispensed_full' ? 'healthy' : 'accent'} className="capitalize">
                  {prescription.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {prescription.medicines.map((medicine) => (
                  <div key={medicine.medicine_id} className="rounded-lg bg-secondary/30 px-3 py-2 text-sm">
                    <div className="font-medium">{medicine.brand_name} {medicine.strength}</div>
                    <div className="text-xs text-muted-foreground">{medicine.dosage}, {medicine.frequency.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
              {prescription.follow_up_date && <div className="mt-3 text-xs text-accent">Follow-up on {formatDate(prescription.follow_up_date)}</div>}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

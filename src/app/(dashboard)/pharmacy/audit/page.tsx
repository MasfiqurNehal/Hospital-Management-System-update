import { ClipboardList } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_PHARMACY_ORDERS } from '@/lib/mock-data';
import { formatBDT, formatDateTime } from '@/lib/utils';

export default function PharmacyAuditPage() {
  const dispensed = MOCK_PHARMACY_ORDERS.filter((order) => order.status === 'dispensed');

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy Audit Log" description="Dispensing accountability, payment status, and batch traceability." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Dispensed Orders" value={dispensed.length} icon={ClipboardList} />
        <KPICard label="Audited Items" value={dispensed.reduce((sum, order) => sum + order.items.length, 0)} icon={ClipboardList} accentColor="accent" />
        <KPICard label="Dispensed Value" value={formatBDT(dispensed.reduce((sum, order) => sum + order.total_amount_bdt, 0))} icon={ClipboardList} accentColor="healthy" />
      </div>

      <SectionCard title="Dispensing Audit" description="SRS Module 6">
        <div className="divide-y divide-border">
          {dispensed.map((order) => (
            <div key={order.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{order.patient_name}</div>
                  <div className="text-sm text-muted-foreground">{order.prescription_number} - {order.doctor_name}</div>
                  <code className="text-xs text-muted-foreground">{order.order_number}</code>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatBDT(order.total_amount_bdt)}</div>
                  <Badge variant={order.payment_status === 'paid' ? 'healthy' : 'warning'}>{order.payment_status}</Badge>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.prescribed_medicine_id} className="rounded-lg bg-secondary/30 px-3 py-2 text-sm">
                    <div className="font-medium">{item.medicine_name}</div>
                    <div className="text-xs text-muted-foreground">Batch {item.batch_number} - qty {item.dispensed_quantity}</div>
                  </div>
                ))}
              </div>
              {order.dispensed_at && <div className="mt-3 text-xs text-muted-foreground">Dispensed by {order.dispensed_by_name} at {formatDateTime(order.dispensed_at)}</div>}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { pharmacyAPI } from '@/lib/mock-api';
import { useAuthStore } from '@/lib/auth-store';
import { formatBDT, formatDate, formatRelative } from '@/lib/utils';
import type { PharmacyOrder, MedicineInventory } from '@/types';

export default function PharmacistDashboardPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [inventory, setInventory] = useState<MedicineInventory[]>([]);
  const [lowStock, setLowStock] = useState<MedicineInventory[]>([]);

  useEffect(() => {
    pharmacyAPI.listOrders().then((r) => setOrders(r.data));
    pharmacyAPI.listInventory().then((r) => setInventory(r.data));
    pharmacyAPI.getLowStockItems().then((r) => setLowStock(r.data));
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'partial');
  const dispensedToday = orders.filter((o) => {
    if (!o.dispensed_at) return false;
    return new Date(o.dispensed_at).toDateString() === new Date().toDateString();
  }).length;
  const totalRevenue = orders
    .filter((o) => o.status === 'dispensed' && o.payment_status === 'paid')
    .reduce((s, o) => s + o.total_amount_bdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.full_name ?? 'Pharmacist'}`}
        description={
          user?.pharmacist_profile
            ? `License: ${user.pharmacist_profile.license_number}`
            : 'Pharmacy workspace'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Pending Orders" value={pendingOrders.length} icon={Package} accentColor="borderline" />
        <KPICard label="Dispensed Today" value={dispensedToday} icon={Package} accentColor="healthy" />
        <KPICard label="Low Stock Items" value={lowStock.length} icon={AlertTriangle} accentColor="critical" />
        <KPICard label="Today's Revenue" value={formatBDT(totalRevenue)} icon={Package} accentColor="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Pending Dispensing Queue"
          description={`${pendingOrders.length} orders waiting`}
        >
          {pendingOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Package} title="Queue is clear" description="No pending orders to dispense." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingOrders.map((o) => (
                <div key={o.id} className="px-4 py-3 hover:bg-secondary/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={o.patient_name} size="sm" />
                      <div>
                        <div className="font-medium">{o.patient_name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{o.patient_mrn}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge
                        variant={
                          o.status === 'partial' ? 'warning'
                          : o.status === 'awaiting_stock' ? 'borderline'
                          : 'secondary'
                        }
                        className="capitalize"
                      >
                        {o.status.replace(/_/g, ' ')}
                      </Badge>
                      <code className="text-[10px] text-muted-foreground">{o.order_number}</code>
                    </div>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    {o.items.map((item, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        {item.medicine_name} × {item.prescribed_quantity}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dr. {o.doctor_name}</span>
                    <span className="font-semibold tabular-nums">{formatBDT(o.total_amount_bdt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Low Stock Alerts"
          description={`${lowStock.length} items need restocking`}
        >
          {lowStock.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Package} title="All stock OK" description="No low stock or out-of-stock items." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${
                      item.is_out_of_stock ? 'bg-critical' : 'bg-borderline'
                    }`}
                  >
                    {item.current_stock}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{item.brand_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.generic_name} · {item.strength}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant={item.is_out_of_stock ? 'critical' : 'borderline'}>
                      {item.is_out_of_stock ? 'Out of stock' : 'Low stock'}
                    </Badge>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Min: {item.min_threshold}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Recent Dispensing History" description="Last completed orders">
        {orders.filter((o) => o.status === 'dispensed').length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Package} title="No dispensed orders" description="Dispensed orders will appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Prescription</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Dispensed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders
                  .filter((o) => o.status === 'dispensed')
                  .map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                          {o.order_number}
                        </code>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{o.patient_name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{o.patient_mrn}</div>
                      </td>
                      <td className="px-3 py-3">
                        <code className="text-xs text-muted-foreground">{o.prescription_number}</code>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{o.items.length} items</td>
                      <td className="px-3 py-3 tabular-nums font-medium">{formatBDT(o.total_amount_bdt)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={o.payment_status === 'paid' ? 'healthy' : 'warning'}>
                          {o.payment_status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {o.dispensed_at ? formatRelative(o.dispensed_at) : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

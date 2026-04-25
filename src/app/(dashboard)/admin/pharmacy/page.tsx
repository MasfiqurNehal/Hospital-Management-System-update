'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Package, Search } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, KPICard } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { pharmacyAPI } from '@/lib/mock-api';
import { formatBDT, formatDate } from '@/lib/utils';
import type { PharmacyOrder, MedicineInventory } from '@/types';

type Tab = 'queue' | 'inventory';

export default function PharmacyPage() {
  const [tab, setTab] = useState<Tab>('queue');
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [inventory, setInventory] = useState<MedicineInventory[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    pharmacyAPI.listOrders().then((r) => setOrders(r.data));
    pharmacyAPI.listInventory().then((r) => setInventory(r.data));
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'partial').length;
  const lowStock = inventory.filter((i) => i.is_low_stock || i.is_out_of_stock).length;
  const dispensedToday = orders.filter((o) => o.status === 'dispensed').length;

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      !q ||
      o.patient_name.toLowerCase().includes(q) ||
      o.patient_mrn.toLowerCase().includes(q) ||
      o.order_number.toLowerCase().includes(q) ||
      o.prescription_number.toLowerCase().includes(q)
    );
  });

  const filteredInventory = inventory.filter((i) => {
    const q = search.toLowerCase();
    return (
      !q ||
      i.generic_name.toLowerCase().includes(q) ||
      i.brand_name.toLowerCase().includes(q) ||
      i.manufacturer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy" description="Dispensing queue and medicine inventory" />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Pending Orders" value={pendingOrders} icon={Package} accentColor="borderline" />
        <KPICard label="Dispensed Today" value={dispensedToday} icon={Package} accentColor="healthy" />
        <KPICard label="Low Stock Items" value={lowStock} icon={AlertTriangle} accentColor="critical" />
      </div>

      <div className="flex gap-1 rounded-xl border border-border bg-secondary/30 p-1 w-fit">
        {(['queue', 'inventory'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(''); }}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'queue' ? 'Dispensing Queue' : 'Inventory'}
          </button>
        ))}
      </div>

      <Input
        leftIcon={<Search className="h-4 w-4" />}
        placeholder={tab === 'queue' ? 'Search orders by patient, MRN, or order#...' : 'Search by medicine name or manufacturer...'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {tab === 'queue' && (
        <SectionCard title="Dispensing Queue" description={`${filteredOrders.length} orders`}>
          {filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Package} title="No orders found" description="Try adjusting your search." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/30">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Order #</th>
                    <th className="px-3 py-3">Patient</th>
                    <th className="px-3 py-3">Prescription</th>
                    <th className="px-3 py-3">Doctor</th>
                    <th className="px-3 py-3">Items</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                          {o.order_number}
                        </code>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={o.patient_name} size="sm" />
                          <div>
                            <div className="font-medium">{o.patient_name}</div>
                            <div className="font-mono text-xs text-muted-foreground">{o.patient_mrn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <code className="text-xs text-muted-foreground">{o.prescription_number}</code>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">{o.doctor_name}</td>
                      <td className="px-3 py-3">
                        <div className="space-y-0.5">
                          {o.items.map((item, i) => (
                            <div key={i} className="text-xs text-muted-foreground">
                              {item.medicine_name} × {item.dispensed_quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 tabular-nums font-medium">{formatBDT(o.total_amount_bdt)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={o.payment_status === 'paid' ? 'healthy' : 'warning'}>
                          {o.payment_status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            o.status === 'dispensed'
                              ? 'healthy'
                              : o.status === 'partial'
                              ? 'warning'
                              : o.status === 'cancelled'
                              ? 'destructive'
                              : o.status === 'awaiting_stock'
                              ? 'borderline'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {o.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {tab === 'inventory' && (
        <SectionCard title="Medicine Inventory" description={`${filteredInventory.length} items`}>
          {filteredInventory.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Package} title="No medicines found" description="Try adjusting your search." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/30">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Medicine</th>
                    <th className="px-3 py-3">Manufacturer</th>
                    <th className="px-3 py-3">Batch</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Min Threshold</th>
                    <th className="px-3 py-3">Expiry</th>
                    <th className="px-3 py-3">Unit Cost</th>
                    <th className="px-3 py-3">Selling</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <div className="font-medium">{item.brand_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.generic_name} · {item.strength}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.manufacturer}</td>
                      <td className="px-3 py-3">
                        <code className="text-xs">{item.batch_number}</code>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`tabular-nums font-semibold ${
                            item.is_out_of_stock
                              ? 'text-critical'
                              : item.is_low_stock
                              ? 'text-borderline'
                              : 'text-foreground'
                          }`}
                        >
                          {item.current_stock}
                        </span>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{item.min_threshold}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(item.expiry_date)}</td>
                      <td className="px-3 py-3 tabular-nums">{formatBDT(item.unit_cost_bdt)}</td>
                      <td className="px-3 py-3 tabular-nums">{formatBDT(item.selling_price_bdt)}</td>
                      <td className="px-3 py-3">
                        {item.is_out_of_stock ? (
                          <Badge variant="critical">Out of stock</Badge>
                        ) : item.is_low_stock ? (
                          <Badge variant="borderline">Low stock</Badge>
                        ) : item.is_expired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="healthy">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

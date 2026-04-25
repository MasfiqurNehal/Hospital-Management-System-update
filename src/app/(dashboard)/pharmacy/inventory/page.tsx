import { Package } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { MOCK_INVENTORY } from '@/lib/mock-data';
import { formatBDT, formatDate } from '@/lib/utils';

export default function PharmacyInventoryPage() {
  const lowStock = MOCK_INVENTORY.filter((item) => item.is_low_stock || item.is_out_of_stock);
  const stockValue = MOCK_INVENTORY.reduce((sum, item) => sum + item.current_stock * item.unit_cost_bdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Medicine Inventory" description="Stock levels, batch expiry, and reorder threshold tracking." />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPICard label="Items" value={MOCK_INVENTORY.length} icon={Package} />
        <KPICard label="Low Stock" value={lowStock.length} icon={Package} accentColor="critical" />
        <KPICard label="Stock Units" value={MOCK_INVENTORY.reduce((sum, item) => sum + item.current_stock, 0)} icon={Package} accentColor="accent" />
        <KPICard label="Stock Value" value={formatBDT(stockValue)} icon={Package} accentColor="healthy" />
      </div>

      <SectionCard title="Inventory Register" description="SRS Module 6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Medicine</th>
                <th className="px-3 py-3">Batch</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Threshold</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Expiry</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_INVENTORY.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="font-medium">{item.brand_name} {item.strength}</div>
                    <div className="text-xs text-muted-foreground">{item.generic_name} - {item.manufacturer}</div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">{item.batch_number}</td>
                  <td className="px-3 py-3 tabular-nums font-semibold">{item.current_stock}</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">{item.min_threshold}</td>
                  <td className="px-3 py-3">{formatBDT(item.selling_price_bdt)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(item.expiry_date)}</td>
                  <td className="px-3 py-3">
                    <Badge variant={item.is_out_of_stock ? 'critical' : item.is_low_stock ? 'borderline' : 'healthy'}>
                      {item.is_out_of_stock ? 'Out' : item.is_low_stock ? 'Low' : 'OK'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

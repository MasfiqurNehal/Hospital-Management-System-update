'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, FlaskConical } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { downloadDocument, viewDocument } from '@/lib/document-utils';
import { labAPI } from '@/lib/mock-api';
import { formatDateTime } from '@/lib/utils';
import type { LabTest } from '@/types';

const patientId = 'patient-001';

export default function PatientLabReportsPage() {
  const [reports, setReports] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [payingTest, setPayingTest] = useState<LabTest | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    setLoading(true);
    labAPI.list({ patient_id: patientId }).then((r) => setReports(r.data)).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    total: reports.length,
    reported: reports.filter((r) => r.status === 'reported').length,
    critical: reports.filter((r) => r.overall_flag === 'critical').length,
  }), [reports]);

  function toResultLines(report: LabTest): string {
    if (!report.results || report.results.length === 0) return 'No test parameters entered.';
    return report.results.map((result, index) => `${index + 1}. ${result.parameter_name}: ${result.value} ${result.unit} (${result.flag})`).join('\n');
  }

  function viewReportDocument(report: LabTest) {
    viewDocument({
      title: `Lab Report ${report.test_number}`,
      fileName: `lab-report-${report.test_number}`,
      fields: [
        { label: 'Report Number', value: report.test_number },
        { label: 'Patient', value: `${report.patient_name} (${report.patient_mrn})` },
        { label: 'Test Name', value: report.test_name },
        { label: 'Doctor', value: report.ordered_by_doctor_name },
        { label: 'Ordered At', value: formatDateTime(report.ordered_at) },
        { label: 'Status', value: report.status.replace(/_/g, ' ') },
        { label: 'Overall Flag', value: report.overall_flag },
        { label: 'Results', value: toResultLines(report) },
      ],
    });
  }

  function downloadReportDocument(report: LabTest) {
    downloadDocument({
      title: `Lab Report ${report.test_number}`,
      fileName: `lab-report-${report.test_number}`,
      fields: [
        { label: 'Report Number', value: report.test_number },
        { label: 'Patient', value: `${report.patient_name} (${report.patient_mrn})` },
        { label: 'Test Name', value: report.test_name },
        { label: 'Doctor', value: report.ordered_by_doctor_name },
        { label: 'Ordered At', value: formatDateTime(report.ordered_at) },
        { label: 'Status', value: report.status.replace(/_/g, ' ') },
        { label: 'Overall Flag', value: report.overall_flag },
        { label: 'Results', value: toResultLines(report) },
      ],
    });
  }

  async function orderTest(e: React.FormEvent) {
    e.preventDefault();
    if (!newTestName) return;
    setOrdering(true);
    try {
      const res = await labAPI.create({ patient_id: patientId, test_name: newTestName, price_bdt: Number(newPrice || 0) });
      setReports((p) => [res.data, ...p]);
      setNewTestName(''); setNewPrice(0);
    } catch (err) {
      // ignore UI error for now
    } finally {
      setOrdering(false);
    }
  }

  async function payForTest(test: LabTest) {
    setPaymentError('');
    setPaymentBusy(true);
    try {
      const [expM, expY] = expiry.split('/');
      const expMonth = parseInt(expM ?? '', 10);
      const expYear = parseInt(expY ?? '', 10);
      const res = await labAPI.payDirect(test.id, {
        card_number: cardNumber.replace(/\s/g, ''),
        exp_month: expMonth || undefined,
        exp_year: expYear ? (expYear < 100 ? 2000 + expYear : expYear) : undefined,
        cvc: cvc.replace(/\D/g, '') || undefined,
      });
      // update list
      const updated = { ...test, payment_status: 'paid' } as LabTest;
      setReports((p) => p.map((r) => (r.id === test.id ? updated : r)));
      setPayingTest(null);
      setCardNumber(''); setExpiry(''); setCvc('');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setPaymentError(e?.message ?? 'Payment failed');
    } finally {
      setPaymentBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Reports" description="Investigation status, reported results, and critical flags." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Reports" value={counts.total} icon={FlaskConical} />
        <KPICard label="Reported" value={counts.reported} icon={FlaskConical} accentColor="healthy" />
        <KPICard label="Critical" value={counts.critical} icon={FlaskConical} accentColor="critical" />
      </div>

      <SectionCard title="Order a Lab Test" description="Create and pay for lab investigations">
        <form onSubmit={orderTest} className="flex items-center gap-3">
          <input className="flex-1 rounded-lg border px-3 py-2" placeholder="Test name (e.g. CBC)" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} />
          <input className="w-32 rounded-lg border px-3 py-2" placeholder="Price (BDT)" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} type="number" />
          <Button type="submit" disabled={ordering}>{ordering ? 'Ordering…' : 'Order'}</Button>
        </form>
      </SectionCard>

      <SectionCard title="My Test Reports" description="SRS Module 5">
        <div className="divide-y divide-border">
          {loading && <div className="p-4">Loading…</div>}
          {!loading && reports.map((report) => (
            <div key={report.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{report.test_name}</div>
                  <div className="text-sm text-muted-foreground">Ordered by {report.ordered_by_doctor_name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(report.ordered_at)}</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={report.overall_flag === 'critical' ? 'critical' : report.overall_flag === 'borderline' ? 'borderline' : 'healthy'}>
                    {report.overall_flag}
                  </Badge>
                  <Badge variant={report.status === 'reported' ? 'healthy' : 'accent'} className="capitalize">{report.status.replace(/_/g, ' ')}</Badge>
                  <div className="text-sm text-muted-foreground">৳{report.price_bdt?.toFixed(2) ?? '0.00'}</div>
                  <Button type="button" size="sm" variant="outline" onClick={() => viewReportDocument(report)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => downloadReportDocument(report)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  {report.payment_status !== 'paid' && Number(report.price_bdt) > 0 && (
                    <Button size="sm" onClick={() => setPayingTest(report)}>Pay</Button>
                  )}
                </div>
              </div>
              {report.results && (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {report.results.map((result) => (
                    <div key={result.parameter_id} className="rounded-lg bg-secondary/30 px-3 py-2 text-sm">
                      <div className="font-medium">{result.parameter_name}</div>
                      <div className="text-xs text-muted-foreground">{result.value} {result.unit} ({result.flag})</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {payingTest && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <FlaskConical className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Pay for {payingTest.test_name}</div>
                  <div className="text-xs text-muted-foreground">{payingTest.test_number}</div>
                </div>
              </div>
              <button type="button" onClick={() => setPayingTest(null)} className="rounded-lg p-1.5">Close</button>
            </div>
            <div className="px-5 py-5">
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-lg font-bold">৳{(payingTest.price_bdt ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted-foreground">Card Number</label>
                  <input className="w-full rounded-lg border px-3 py-2" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Expiry (MM/YY)</label>
                      <input className="w-full rounded-lg border px-3 py-2" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">CVC</label>
                      <input className="w-full rounded-lg border px-3 py-2" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} />
                    </div>
                  </div>
                </div>

                {paymentError && <div className="text-sm text-red-600">{paymentError}</div>}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setPayingTest(null)}>Cancel</Button>
                  <Button className="flex-1" disabled={paymentBusy} onClick={() => payForTest(payingTest)}>
                    {paymentBusy ? 'Processing…' : `Pay ৳${(payingTest.price_bdt ?? 0).toFixed(2)}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

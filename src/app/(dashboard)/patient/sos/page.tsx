'use client';

import { useState } from 'react';
import { AlertTriangle, LifeBuoy } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { emergencyAPI } from '@/lib/mock-api';

export default function PatientSOSPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function triggerSOS() {
    setLoading(true);
    try {
      await emergencyAPI.triggerSOS();
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="SOS Emergency" description="One-tap emergency request and ambulance dispatch alert." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Dispatcher SLA" value="< 2 min" icon={LifeBuoy} accentColor="critical" />
        <KPICard label="ER Pre-alert" value="Enabled" icon={LifeBuoy} accentColor="accent" />
        <KPICard label="Ambulance" value="Available" icon={LifeBuoy} accentColor="healthy" />
      </div>

      <SectionCard title="Emergency Dispatch" description="SRS Module 7">
        <div className="p-6">
          <div className={`rounded-2xl border-2 p-6 text-center ${sent ? 'border-healthy/40 bg-healthy/5' : 'border-critical/40 bg-critical/5'}`}>
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${sent ? 'bg-healthy' : 'bg-critical pulse-critical'}`}>
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h2 className={`mt-4 text-2xl font-bold ${sent ? 'text-healthy' : 'text-critical'}`}>
              {sent ? 'Emergency request sent' : 'Press SOS only for real emergencies'}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              This demo calls the mock emergency API. Later, Laravel will connect this flow to ambulance dispatch, ER pre-notification, SMS, and in-app HAS alerts.
            </p>
            <div className="mt-6">
              {sent ? (
                <Badge variant="healthy" className="px-4 py-2 text-sm">Dispatcher alerted</Badge>
              ) : (
                <Button variant="destructive" size="lg" loading={loading} onClick={triggerSOS}>
                  {!loading && <AlertTriangle className="h-5 w-5" />}
                  Trigger SOS
                </Button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

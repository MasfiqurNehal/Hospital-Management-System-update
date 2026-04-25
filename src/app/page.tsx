'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bed,
  CheckCircle2,
  CreditCard,
  FlaskConical,
  HeartPulse,
  Mail,
  MapPin,
  Menu,
  Phone,
  Pill,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore, roleDashboardPath } from '@/lib/auth-store';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(roleDashboardPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Activity className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-base font-black tracking-tight">HMS Alert</div>
              <div className="-mt-1 text-[11px] font-medium text-muted-foreground">Hospital Management System</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#about" className="hover:text-primary">About</a>
            <a href="#modules" className="hover:text-primary">Modules</a>
            <a href="#workflow" className="hover:text-primary">Workflow</a>
            <a href="#contact" className="hover:text-primary">Contact</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden border-primary/15 bg-white/70 text-primary shadow-sm hover:bg-primary hover:text-white min-[420px]:inline-flex"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-primary to-accent px-3 shadow-lg shadow-primary/20 hover:brightness-105 sm:px-4"
            >
              <Link href="/register">Sign up <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
            <a href="#modules" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary lg:hidden">
              <Menu className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-auth-gradient" />
          <div className="absolute inset-0 -z-10 bg-grid opacity-20" />
          <div className="absolute left-1/2 top-20 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 text-white sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Medical, healthcare, diagnostic and emergency platform
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Full Hospital Management and Alert System for modern care teams.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                A responsive frontend for doctors, admins, patients, nurses, reception,
                pharmacy, lab, billing, beds, prescriptions and real-time HAS alerts.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-[52px] rounded-xl bg-white px-7 text-primary shadow-2xl shadow-black/25 ring-1 ring-white/30 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-accent/20"
                >
                  <Link href="/login">Enter the system <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-[52px] rounded-xl border-white/25 bg-white/10 px-7 text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <Link href="#contact">Contact developer</Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
                {['Role-based dashboards', 'Keyboard and mouse friendly', 'Backend-ready architecture'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-white/15 bg-white/95 p-4 shadow-2xl shadow-black/20 sm:p-5">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today overview</div>
                    <div className="text-2xl font-black text-foreground">Demo Medical Center</div>
                  </div>
                  <div className="rounded-full bg-healthy/10 px-3 py-1 text-xs font-bold text-healthy">Live</div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Appointments', value: '142', icon: Users },
                    { label: 'Active alerts', value: '3', icon: AlertTriangle },
                    { label: 'Bed occupancy', value: '78.6%', icon: Bed },
                    { label: 'Revenue', value: 'BDT 284k', icon: CreditCard },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-border bg-card p-4">
                      <metric.icon className="h-5 w-5 text-primary" />
                      <div className="mt-3 text-2xl font-black">{metric.value}</div>
                      <div className="text-xs font-medium text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-primary p-4 text-white">
                  <div className="flex items-start gap-3">
                    <HeartPulse className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <div className="font-semibold">Critical lab alert delivered</div>
                      <p className="mt-1 text-sm text-white/75">Doctors and admins receive urgent SMS, email and in-app alerts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-primary">About HMS Alert</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Built for hospitals, clinics, diagnostics and care operations.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                This frontend is designed to be connected with PHP Laravel, PostgreSQL,
                developer sandbox Stripe, SSLCommerz, OTP verification, email, SMS and
                production-grade authentication when the backend is added.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Doctor prescriptions and medicine workflows',
                'Admin management for beds, billing, staff and services',
                'Patient appointments, reports, timeline and SOS',
                'Lab, pharmacy, nurse and reception daily workspaces',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <div className="mt-3 font-semibold">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="bg-medical-pattern py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-sm font-bold uppercase tracking-widest text-primary">More Modules</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Everything managed by mouse click and keyboard press.</h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Clinical Care', desc: 'Patients, appointments, prescriptions and lab orders.', icon: Stethoscope },
                { title: 'Diagnostics', desc: 'Pending tests, reference ranges and critical reporting.', icon: FlaskConical },
                { title: 'Pharmacy', desc: 'Dispensing queue, medicine stock and audit logs.', icon: Pill },
                { title: 'Operations', desc: 'Beds, billing, OPD/IPD, analytics and staff.', icon: Bed },
              ].map((module) => (
                <Card key={module.title} className="p-5 transition-all hover:-translate-y-1 hover:shadow-elevated">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <module.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { title: '1. Login or sign up', desc: 'Users enter through secure auth pages and are sent to the right role dashboard.' },
              { title: '2. Manage hospital work', desc: 'Doctors, admins, patients and staff work only in their assigned modules.' },
              { title: '3. Connect backend later', desc: 'Laravel, PostgreSQL, payments, OTP, email and SMS can replace mock APIs.' },
            ].map((step) => (
              <div key={step.title} className="rounded-3xl bg-primary p-6 text-white">
                <h3 className="text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/75">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="border-y border-border bg-card py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-primary">Developer Credit</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Developed by Md. Masfiqur Rahman Nehal.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                Main contributor and full system developer for this Hospital Management and Alert System frontend.
              </p>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4">
                <Phone className="h-5 w-5 shrink-0 text-primary" /> Add hospital support phone from backend settings
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4">
                <Mail className="h-5 w-5 shrink-0 text-primary" /> Add email, OTP and verification flows with Laravel
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-primary" /> Bangladesh-ready healthcare operations
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary px-4 py-6 text-center text-sm text-white/75">
        (c) 2026 HMS Alert. 
      </footer>
    </div>
  );
}

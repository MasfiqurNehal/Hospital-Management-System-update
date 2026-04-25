'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  BriefcaseMedical,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FlaskConical,
  HeartHandshake,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore, roleDashboardPath } from '@/lib/auth-store';

// Replace these files later with your own photos inside /public/real-images.
const landingImages = {
  hero: '/real-images/doctor-consultation-real.jpg',
  patientSupport: '/real-images/nurse-patient-real.jpg',
  diagnostics: '/real-images/lab-technician-real.jpg',
  serviceFallback: '/medical-team-scene.svg',
};

const primaryNav = [
  { label: 'Solutions', href: '#solutions', hasMenu: true },
  { label: 'Knowledge Center', href: '#resources', hasMenu: true },
  { label: 'About Us', href: '#why-us', hasMenu: true },
  { label: 'HMS Marketplace', href: '#platform', hasMenu: false },
];

const utilityNav = ['Login', 'Support', 'Events', 'Careers', 'Contact', '877-932-6301'];

const featurePillars = [
  {
    title: 'Remove the noise, restore the human connection',
    description: 'Deliver coordinated care services that keep patients, doctors and support teams connected.',
    icon: HeartHandshake,
    image: landingImages.patientSupport,
  },
  {
    title: 'Stop revenue leakage at the source',
    description: 'Strengthen billing, pharmacy and operational support services with clearer follow-through.',
    icon: CircleDollarSign,
    image: landingImages.diagnostics,
  },
  {
    title: 'Connect the care journey at every step',
    description: 'Support every step of the patient journey with responsive hospital services and timely communication.',
    icon: MessageCircle,
    image: landingImages.hero,
  },
];

const metricItems = [
  {
    value: '14,000',
    label: 'hours saved annually with coordinated clinical and admin workflows',
  },
  {
    value: '$1M',
    label: 'in potential revenue uplift with tighter hospital operations and billing visibility',
  },
  {
    value: '>10%',
    label: 'patient capacity improvement when staff can move through one connected platform',
  },
];

const serviceCards = [
  {
    title: 'Doctor consultation services',
    text: 'Support outpatient and inpatient consultations, care planning, prescriptions and follow-up treatment guidance.',
    icon: Stethoscope,
    image: landingImages.hero,
  },
  {
    title: 'Lab and diagnostic services',
    text: 'Offer test coordination, result delivery, urgent reporting and prescription-linked diagnostic support.',
    icon: FlaskConical,
    image: landingImages.diagnostics,
  },
  {
    title: 'Patient support and billing services',
    text: 'Handle appointments, admissions, billing, pharmacy support and patient assistance with a service-first approach.',
    icon: BriefcaseMedical,
    image: landingImages.patientSupport,
  },
];

const whyItems = [
  'Unified service presentation across clinical care, operations, pharmacy, diagnostics and patient access.',
  'AI-ready foundation for future Laravel APIs, OTP flows, alerts, reporting and automation services.',
  'Built for trust with cleaner hierarchy, calmer spacing and a stronger healthcare visual identity.',
];

const resourceCards = [
  {
    eyebrow: 'BROCHURE',
    category: 'Operations Blueprint',
    title: 'Guide to unlocking the full value of connected hospital services',
    description: 'See how admissions, clinical care and billing services can work together around the patient journey.',
    image: landingImages.hero,
    accent: 'from-[#24d1ae]/30 via-[#24d1ae]/10 to-transparent',
  },
  {
    eyebrow: 'BLOG',
    category: 'Revenue Integrity',
    title: 'How to reduce missed handoffs between care services and revenue operations',
    description: 'A practical breakdown of where hospital services lose continuity and how better coordination improves outcomes.',
    image: landingImages.diagnostics,
    accent: 'from-[#50b8ff]/30 via-[#50b8ff]/10 to-transparent',
  },
  {
    eyebrow: 'INFOGRAPHIC',
    category: 'Workflow Design',
    title: '4 ways responsive hospital services improve coordination and efficiency',
    description: 'Compare the biggest patient and staff experience wins when services are designed to work together.',
    image: landingImages.serviceFallback,
    accent: 'from-[#8a7bff]/24 via-[#8a7bff]/8 to-transparent',
  },
  {
    eyebrow: 'BLOG',
    category: 'Patient Journey',
    title: 'Why modern patient engagement depends on visibility across the entire journey',
    description: 'From first appointment to follow-up, patients trust care services that make every next step obvious.',
    image: landingImages.patientSupport,
    accent: 'from-[#ffd58e]/25 via-[#ffd58e]/8 to-transparent',
  },
];

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 rounded-full bg-[#35d0ad]">
        <div className="absolute inset-[9px] rounded-full border-[8px] border-white border-r-transparent border-t-transparent rotate-45" />
        <div className="absolute right-[10px] top-[7px] h-4 w-4 rotate-45 bg-[#7ee5ce]" />
      </div>
      <div className={`text-[18px] font-extrabold leading-[0.95] ${dark ? 'text-white' : 'text-slate-700'}`}>
        <div>HMS</div>
        <div>Alert</div>
      </div>
    </div>
  );
}

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(roleDashboardPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfbf8] text-[#25345a]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="hidden border-b border-slate-200 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-end gap-6 px-6 py-3 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            {utilityNav.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="border-b border-slate-200 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 animate-fade-down sm:px-6 lg:px-8">
            <Link href="/" aria-label="HMS Alert home" className="animate-scale-in">
              <BrandMark />
            </Link>

            <nav className="hidden items-center gap-10 text-[15px] font-semibold text-slate-950 lg:flex">
              {primaryNav.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-1 animate-fade-down stagger-${Math.min(index + 1, 5)} hover:text-primary`}
                >
                  {item.label}
                  {item.hasMenu ? <ChevronDown className="h-4 w-4 text-accent" /> : null}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                asChild
                className="rgb-button hidden h-12 rounded-full border border-[#25c9a7] bg-[#1f2a44] px-7 text-[15px] font-semibold text-white shadow-none hover:bg-[#24314f] sm:inline-flex"
              >
                <Link href="/register">Start a Conversation <ChevronRight className="h-4 w-4" /></Link>
              </Button>
              <a
                href="#solutions"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#1f2a44] text-white">
          <div className="absolute inset-0">
            <div className="absolute -left-20 top-52 h-[340px] w-[340px] rounded-full border-2 border-[#1fc8a7]/45 animate-spin-slow" />
            <div className="absolute left-0 top-64 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(49,212,177,0.28),_rgba(49,212,177,0))]" />
            <div className="absolute right-20 top-[-120px] h-[460px] w-[460px] rounded-full border-2 border-[#1fc8a7]/35 animate-spin-slower" />
            <div className="absolute right-0 top-56 h-[280px] w-[280px] rounded-full border-2 border-[#1fc8a7]/35" />
            <div className="absolute right-40 top-52 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(49,212,177,0.24),_rgba(49,212,177,0))]" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-20 text-center sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-28 lg:text-left">
            <div>
              <div className="w-fit max-lg:mx-auto">
                <div className="animate-scale-in">
                  <BrandMark dark />
                </div>
              </div>
              <h1 className="mx-auto mt-10 max-w-4xl animate-fade-up-slow text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:mx-0 lg:text-[4.2rem]">
                Reinvent hospital services.
                <br />
                Restore better care.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl animate-fade-up-slow stagger-2 text-base leading-8 text-slate-200 sm:text-xl lg:mx-0">
                HMS Alert presents your hospital services in a cleaner, more trusted way, highlighting
                consultations, diagnostics, patient support, billing and follow-up care across every screen.
              </p>
              <div className="mt-9 animate-fade-up-slow stagger-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rgb-button h-12 rounded-full border-[#18c8a8] bg-transparent px-6 text-[15px] font-semibold text-[#20d0ae] hover:bg-[#20d0ae]/10 hover:text-[#8ff0db]"
                >
                  <Link href="#platform">Explore the Platform <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3 lg:mx-0">
                {['Consultation', 'Diagnostics', 'Patient Care'].map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-sm animate-fade-up-slow stagger-${Math.min(index + 2, 5)}`}
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#7fead1]">{item}</div>
                    <div className="mt-2 text-lg font-semibold text-white/90">
                      Responsive hospital services designed to feel clear on every device.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Reveal delay={120}>
              <Card className="rgb-border-card overflow-hidden rounded-[1.75rem] border-0 bg-white/10 p-3 shadow-[0_30px_80px_rgba(8,47,73,0.4)] backdrop-blur-md">
                <div className="relative overflow-hidden rounded-[1.35rem]">
                  <img
                    src={landingImages.hero}
                    alt="Doctor consultation real image"
                    className="h-[460px] w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,42,68,0.08),rgba(31,42,68,0.72))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-left">
                    <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#8ff0db]">
                      Image path: {landingImages.hero}
                    </div>
                    <div className="mt-4 text-2xl font-black text-white">Real medical photo in hero</div>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
                      This file lives in `public/real-images`, so you can replace it manually later.
                    </p>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        <section className="bg-[#f6f2eb] py-10">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[240px_1fr] lg:items-center lg:px-8">
            <div className="mx-auto flex h-40 w-40 animate-float-soft items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#90a0ac,_#55626f)] text-center text-white shadow-[0_20px_50px_rgba(15,23,42,0.15)]">
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide">Trusted Care</div>
                <div className="mt-2 text-4xl font-black">2026</div>
              </div>
            </div>
            <Reveal delay={80}>
              <div className="max-w-2xl">
                <h2 className="text-3xl font-black leading-tight text-[#25345a] sm:text-4xl">
                  Built for hospitals that want to present their services with clarity and trust.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  The new design language follows the reference theme closely while shifting the
                  message toward patient care services, department support and hospital expertise.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="solutions" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="mx-auto max-w-3xl text-center text-4xl font-black leading-tight text-[#25345a] sm:text-5xl">
                One workflow. One platform.
                <br />
                All the difference.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-10 lg:grid-cols-3">
              {featurePillars.map((item, index) => (
                <Reveal key={item.title} delay={index * 110}>
                  <div className="group text-center">
                    <div className="rgb-border-card mx-auto mb-5 overflow-hidden rounded-[1.6rem] border border-slate-100 bg-[#eef5f4] shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#34d0ae]/12 text-[#34d0ae]">
                      <item.icon className="h-10 w-10" strokeWidth={1.8} />
                    </div>
                    <h3 className="mx-auto mt-6 max-w-xs text-2xl font-black leading-tight text-[#25345a]">
                      {item.title}
                    </h3>
                    <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-slate-600">
                      {item.description}
                    </p>
                    <a href="#platform" className="mt-4 inline-flex items-center gap-1 text-lg font-medium text-[#10b797]">
                      Learn More
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f2eb] py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <Reveal delay={60}>
              <div className="max-w-xl">
                <h2 className="text-4xl font-black leading-tight text-[#25345a]">
                  Designed for the way modern hospital teams actually operate.
                </h2>
                <p className="mt-6 text-lg leading-8 text-slate-700">
                  HMS Alert now tells a clearer service story, helping visitors quickly understand
                  the care, diagnostic, patient support and operational services your hospital provides.
                </p>
                <Button
                  asChild
                  className="rgb-button mt-8 h-12 rounded-full border border-[#25c9a7] bg-[#1f2a44] px-7 text-[15px] font-semibold text-white shadow-none hover:bg-[#24314f]"
                >
                  <Link href="/register">Experience HMS Alert <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={170}>
              <div className="relative">
                <div className="absolute -left-8 bottom-12 h-40 w-40 rounded-full bg-[#87ead4]/35 blur-sm animate-float-soft" />
                <div className="absolute right-10 top-12 h-40 w-40 rounded-full bg-[#dad6f0]/50 blur-sm animate-float-soft stagger-4" />
                <Card className="rgb-border-card relative overflow-hidden rounded-[1.6rem] border-0 bg-white p-0 shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
                  <img
                    src={landingImages.patientSupport}
                    alt="Nurse and patient real image"
                    className="h-[420px] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(31,42,68,0.72))] p-5 text-sm font-medium text-white">
                    Image path: {landingImages.patientSupport}
                  </div>
                </Card>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[#1f2a44] py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                Measurable impact for your practice
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {metricItems.map((item, index) => (
                <Reveal key={item.value} delay={index * 120}>
                  <div>
                    <div className="text-5xl font-black text-white drop-shadow-[0_8px_26px_rgba(49,212,177,0.18)]">{item.value}</div>
                    <p className="mx-auto mt-4 max-w-xs text-xl leading-9 text-slate-100">
                      {item.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-12 text-base italic text-slate-200">
              Built to reflect the value of strong hospital services across care delivery and patient operations.
            </p>
          </div>
        </section>

        <section id="why-us" className="bg-[#f6f2eb] py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-start lg:px-8">
            <Reveal>
              <div>
                <h2 className="text-center text-4xl font-black text-[#25345a] sm:text-5xl lg:text-left">
                  Why HMS Alert?
                </h2>
                <div className="mt-10 max-w-2xl text-lg leading-8 text-slate-700">
                  <p>
                    HMS Alert is positioned to showcase how your hospital serves patients with
                    better care coordination, stronger communication and dependable support services.
                  </p>
                  <ul className="mt-6 space-y-5">
                    {whyItems.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#19c8a7]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <Card className="rgb-border-card overflow-hidden rounded-[1.5rem] border-0 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
                <div className="relative min-h-[360px]">
                  <img
                    src={landingImages.serviceFallback}
                    alt="Medical team scene"
                    className="h-full min-h-[360px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.9))]" />
                  <div className="absolute inset-x-0 bottom-0 p-8 text-center">
                    <div className="mx-auto w-fit">
                      <BrandMark />
                    </div>
                    <p className="mt-6 text-lg leading-8 text-slate-700">
                      Supporting image: {landingImages.serviceFallback}
                    </p>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        <section id="platform" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center">
                <h2 className="text-4xl font-black text-[#25345a] sm:text-5xl">
                  Services You Can Explore
                </h2>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {serviceCards.map((card, index) => (
                <Reveal key={card.title} delay={index * 110}>
                  <Card className="rgb-border-card group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(15,23,42,0.14)]">
                    <div className="relative overflow-hidden bg-[#edf8f4]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(36,209,174,0.18),_transparent_38%)]" />
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-700 backdrop-blur-sm">
                        {card.image}
                      </div>
                    </div>
                    <div className="p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#35d0ad]/10 text-[#35d0ad]">
                        <card.icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-6 text-2xl font-black leading-tight text-[#25345a]">{card.title}</h3>
                      <p className="mt-4 text-base leading-7 text-slate-600">{card.text}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="bg-[#fcfbf8] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center">
                <h2 className="text-4xl font-black text-[#25345a] sm:text-5xl">Resources You Can Use</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  This area now highlights service-related resources with clearer imagery, calmer spacing and subtle motion so the cards feel alive instead of stacked.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
              {resourceCards.map((card, index) => (
                <Reveal key={`${card.title}-${index}`} delay={index * 90}>
                  <Card className="rgb-border-card group overflow-hidden rounded-[1.25rem] border border-[#d9dde7] bg-white text-[#25345a] shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_65px_rgba(15,23,42,0.16)]">
                    <div className="relative overflow-hidden bg-[#1f2a44]">
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-90 transition-transform duration-700 group-hover:scale-110`} />
                      <div className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
                        {card.category}
                      </div>
                      <div className="absolute left-5 top-5 h-16 w-16 rounded-full bg-[radial-gradient(circle,_rgba(36,209,174,0.28),_rgba(36,209,174,0))] animate-float-soft" />
                      <div className="absolute bottom-4 right-6 h-20 w-20 rounded-full border border-white/10 opacity-60 transition-transform duration-700 group-hover:scale-110" />
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-48 w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,42,68,0.04),rgba(31,42,68,0.42))]" />
                    </div>
                    <div className="p-6">
                      <div className="text-sm font-black tracking-wide text-[#17c9a7]">{card.eyebrow}</div>
                      <h3 className="mt-3 text-[1.95rem] font-black leading-tight text-[#25345a]">
                        {card.title}
                      </h3>
                      <p className="mt-4 text-base leading-7 text-slate-600">
                        {card.description}
                      </p>
                      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Image file: {card.image}
                      </div>
                      <a
                        href="#contact"
                        className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-[#17c9a7] transition-transform duration-300 group-hover:translate-x-1"
                      >
                        Read More <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                asChild
                className="rgb-button h-12 rounded-full border border-[#25c9a7] bg-[#1f2a44] px-8 text-[15px] font-semibold text-white shadow-none hover:bg-[#24314f]"
              >
                <Link href="#resources">Explore Knowledge Center <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden bg-[#1f2a44] py-20 text-white">
          <div className="absolute inset-0">
            <div className="absolute -left-20 top-0 h-[320px] w-[320px] rounded-full border-2 border-[#1fc8a7]/45 animate-spin-slow" />
            <div className="absolute right-20 top-[-120px] h-[440px] w-[440px] rounded-full border-2 border-[#1fc8a7]/35 animate-spin-slower" />
            <div className="absolute right-36 top-36 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(49,212,177,0.25),_rgba(49,212,177,0))]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center">
                <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
                  Join us in shaping the future of ambulatory healthcare.
                </h2>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rgb-button mt-8 h-12 rounded-full border-[#18c8a8] bg-transparent px-6 text-[15px] font-semibold text-white hover:bg-white/5"
                >
                  <Link href="/register">Talk to an Expert <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </Reveal>

            <div className="mt-20 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-[1.1fr_1.35fr_0.8fr]">
              <Reveal>
                <div>
                  <BrandMark dark />
                  <p className="mt-8 max-w-sm text-2xl leading-10 text-slate-300">
                    Reinvent hospital services. Restore better care.
                  </p>
                  <div className="mt-10 flex gap-5 text-slate-400">
                    <div className="rounded-full border border-white/10 p-2"><Users className="h-5 w-5" /></div>
                    <div className="rounded-full border border-white/10 p-2"><BookOpen className="h-5 w-5" /></div>
                    <div className="rounded-full border border-white/10 p-2"><Building2 className="h-5 w-5" /></div>
                    <div className="rounded-full border border-white/10 p-2"><ShieldCheck className="h-5 w-5" /></div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div className="grid gap-10 md:grid-cols-2">
                  <div className="border-white/10 md:border-l md:pl-8">
                    <h3 className="text-3xl font-black text-slate-300">Solutions</h3>
                    <div className="mt-8 space-y-5 text-xl font-semibold text-white">
                      <a href="#solutions" className="block">Doctor Workspace</a>
                      <a href="#solutions" className="block">Hospital EHR</a>
                      <a href="#solutions" className="block">Clinical Assist</a>
                      <a href="#platform" className="block">Patient Connect</a>
                    </div>
                  </div>
                  <div className="border-white/10 md:border-l md:pl-8">
                    <h3 className="text-3xl font-black text-slate-300">Company</h3>
                    <div className="mt-8 space-y-5 text-xl font-semibold text-white">
                      <a href="#why-us" className="block">About Us</a>
                      <a href="#resources" className="block">Resources</a>
                      <a href="#contact" className="block">Leadership</a>
                      <a href="/login" className="block">Login</a>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <Card className="rgb-border-card self-end overflow-hidden rounded-none border-0 bg-white/6 text-white shadow-none">
                  <div className="relative p-8">
                    <div className="absolute inset-0 opacity-70">
                      <div className="absolute right-8 top-6 h-52 w-52 rounded-full border border-[#1fc8a7]/25" />
                      <div className="absolute bottom-4 right-6 h-14 w-14 rounded-full bg-[radial-gradient(circle,_rgba(49,212,177,0.22),_rgba(49,212,177,0))]" />
                    </div>
                    <div className="relative">
                      <h3 className="text-4xl font-black leading-tight">
                        HMS Alert helps present your healthcare services with confidence.
                      </h3>
                      <Button
                        asChild
                        variant="outline"
                        className="rgb-button mt-8 h-11 rounded-full border-white bg-transparent px-5 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white"
                      >
                        <Link href="#platform">Explore The Platform <ArrowRight className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        <a
          href="#contact"
          className="fixed bottom-7 right-7 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#31d4b1] text-white shadow-[0_18px_40px_rgba(49,212,177,0.35)]"
          aria-label="Chat with us"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      </main>
    </div>
  );
}

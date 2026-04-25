import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plug, Search, Send, Check, ArrowRight, Code2, Mail } from "lucide-react";

// ---------------------------------------------------------------------------
// Sub-components (all server-safe, no 'use client')
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#por-que', label: 'Por qué' },
  { href: '#contacto', label: 'Contacto' },
] as const;

function NavBar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[60px] flex items-center border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-50 text-base tracking-tight hover:text-emerald-400 transition-colors shrink-0"
        >
          <span aria-hidden="true">💸</span>
          <span className="hidden xs:inline sm:inline">DimeCuando</span>
          <span className="xs:hidden sm:hidden">DimeCuando</span>
        </Link>

        {/* Anchor menu — hidden on small screens */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            href="https://github.com/Ealanisln/invoice-chaser"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
            aria-label="GitHub"
          >
            <Code2 className="size-4" />
            <span className="hidden lg:inline">GitHub</span>
          </Link>
          <Button
            asChild
            variant="default"
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition-all hover:scale-[1.02]"
          >
            <Link href="/app">
              <span className="hidden sm:inline">Probar el agente</span>
              <span className="sm:hidden">Probar</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden pt-[60px]"
      aria-label="Hero"
    >
      {/* Background: radial emerald glow + subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.696 0.17 162.48 / 0.10) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.985 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.985 0 0) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 md:py-24 text-center">
        {/* Pill badge */}
        <div className="mb-6 sm:mb-8 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-medium text-emerald-400 tracking-wide uppercase">
          Hackathon Vercel · Zero to Agent · Track 2
        </div>

        {/* H1 */}
        <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-50 leading-[1.08] mb-5 sm:mb-6">
          DimeCuando{" "}
          <span className="text-emerald-400">te van a pagar.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-8 sm:mb-10 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-300 px-2">
          El agente que persigue a tus clientes morosos sin que tú quedes de
          pesado. Detecta facturas vencidas en tu Gmail, te arma el correo con
          el tono justo —de buena onda hasta &ldquo;ya valiste&rdquo;— y tú
          nomás le picas a copiar.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <Button
            asChild
            variant="default"
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-8 h-12 text-base transition-all hover:scale-[1.02]"
          >
            <Link href="/app">
              Probar el agente
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 hover:border-emerald-500/30 h-12 px-8 text-base transition-all"
          >
            <Link href="#video">Ver el video</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

interface StatItem {
  value: string;
  label: string;
  mono?: boolean;
}

const STATS: StatItem[] = [
  {
    value: "$148K MXN",
    label: "promedio que te deben tus clientes morosos cada año",
    mono: true,
  },
  {
    value: "30 → 18 días",
    label: "tiempo medio de cobro cuando un agente sí da seguimiento",
    mono: true,
  },
  {
    value: "5 horas",
    label: "de hackathon en CDMX para armar un agente real, no un demo de juguete",
    mono: true,
  },
];

function StatsSection() {
  return (
    <section
      aria-label="Estadísticas"
      className="border-y border-zinc-800 bg-zinc-900/30"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
        {STATS.map((stat) => (
          <div key={stat.value} className="flex flex-col gap-2">
            <span
              className={cn(
                "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-50",
                stat.mono && "font-mono"
              )}
            >
              {stat.value}
            </span>
            <span className="text-sm text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

interface Step {
  number: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Le das acceso a tu Gmail",
    description:
      "OAuth en 10 segundos vía Composio. Tu inbox, tu data, tus reglas. Sin guardar nada de ese lado.",
    Icon: Plug,
  },
  {
    number: "02",
    title: "El agente caza a los morosos",
    description:
      "Revisa tus enviados, ubica quién no te ha pagado y los acomoda por días vencidos y lana pendiente.",
    Icon: Search,
  },
  {
    number: "03",
    title: "Tú apruebas, te disparas el correo",
    description:
      "Tres tonos según el historial: de buena onda, firme, o aviso final. Copias y mandas. Sigues con tu chamba.",
    Icon: Send,
  },
];

function HowItWorksSection() {
  return (
    <section id="como-funciona" aria-labelledby="how-heading" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 sm:mb-12 text-center">
          <h2
            id="how-heading"
            className="text-balance text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-tight"
          >
            Cómo funciona
          </h2>
          <p className="mt-3 text-zinc-400 text-base">
            Tres pasos. Sin configuraciones raras. Sin CSVs ni Excel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step) => (
            <article
              key={step.number}
              className={cn(
                "group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6",
                "transition-all duration-200 hover:border-emerald-500/30 hover:bg-zinc-900/80"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <step.Icon className="size-5" />
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-600 tracking-widest">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-zinc-50 leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const WHY_BULLETS = [
  "Recordatorios con onda humana, no plantillas chafas",
  "Tu cliente jamás se entera que es un bot el que escribe",
  "Cada follow-up cuida la relación, no la quema",
];

function WhyItMattersSection() {
  return (
    <section
      id="por-que"
      aria-labelledby="why-heading"
      className="scroll-mt-20 py-16 md:py-24 border-t border-zinc-800"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2
          id="why-heading"
          className="sr-only"
        >
          Por qué importa
        </h2>

        {/* Quote block */}
        <blockquote className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 sm:px-8 py-8 sm:py-10 mb-8 sm:mb-10">
          <span
            className="absolute -top-4 left-8 font-serif text-5xl leading-none text-emerald-500/40 select-none"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-zinc-100 leading-relaxed text-balance">
            El 47% de las facturas a freelancers se pagan tarde. La mitad de ese
            delay es solo porque no mandaste el recordatorio a tiempo.
          </p>
          <footer className="mt-6 text-sm text-zinc-500">
            — Encuesta freelance LATAM 2025
          </footer>
        </blockquote>

        {/* Bullets */}
        <ul className="flex flex-col gap-4 text-left" role="list">
          {WHY_BULLETS.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                <Check className="size-3 text-emerald-400" aria-hidden="true" />
              </span>
              <span className="text-base text-zinc-300 leading-relaxed">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const TECH_STACK =
  "Construido con: Vercel AI SDK v6 · v0 · Composio Gmail MCP · Google Gemini · Next.js 16 · Tailwind";

function TechBadgesSection() {
  return (
    <section aria-label="Stack tecnológico" className="py-8 sm:py-10 border-t border-zinc-800/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <p className="text-xs sm:text-sm text-zinc-500 font-mono tracking-wide leading-relaxed break-words">
          {TECH_STACK}
        </p>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section
      id="contacto"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 py-16 md:py-24 border-t border-zinc-800"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2
          id="contact-heading"
          className="text-balance text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-tight mb-3 sm:mb-4"
        >
          ¿Tu inbox también está lleno de &ldquo;te transfiero mañana&rdquo;?
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Si lo quieres montar en tu chamba, integrar otro inbox, o nomás
          platicarle cómo escalarlo, ahí me marcas.
        </p>
        <a
          href="mailto:emmanuel@alanis.dev?subject=Invoice%20Chaser"
          className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:text-emerald-200 transition-all"
        >
          <Mail className="size-4 sm:size-[18px]" aria-hidden="true" />
          emmanuel@alanis.dev
        </a>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="py-16 md:py-24 border-t border-zinc-800"
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6 flex flex-col items-center text-center gap-6 sm:gap-8">
        <h2
          id="final-cta-heading"
          className="text-balance text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-tight"
        >
          Tienes 5 minutos.
          <br />
          <span className="text-zinc-400 font-normal text-3xl md:text-4xl">
            Tus clientes ya tuvieron 60 días.
          </span>
        </h2>

        <Button
          asChild
          variant="default"
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-10 h-14 text-lg transition-all hover:scale-[1.02]"
        >
          <Link href="/app">
            Empezar ahora
            <ArrowRight className="ml-1 size-5" />
          </Link>
        </Button>

        <p className="text-sm text-zinc-500">
          Demo abierto. Sin registro. Sin tarjeta. Ándale.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-zinc-500">
          <p>
            &copy; 2026 DimeCuando &middot; MIT &middot; por{' '}
            <a
              href="mailto:emmanuel@alanis.dev"
              className="hover:text-emerald-400 transition-colors"
            >
              Emmanuel Alanis
            </a>
          </p>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <p className="inline-flex items-center justify-center gap-1.5">
            Hecho con <span className="text-rose-400" aria-label="amor">♥</span> en CDMX
          </p>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center" aria-label="Footer links">
          <a
            href="mailto:emmanuel@alanis.dev"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Mail className="size-3.5" aria-hidden="true" />
            Contacto
          </a>
          <Link
            href="https://github.com/Ealanisln/invoice-chaser"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Code2 className="size-3.5" aria-hidden="true" />
            GitHub
          </Link>
          <Link
            href="https://community.vercel.com/hackathons/zero-to-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Vercel hackathon
          </Link>
        </nav>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page (server component)
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans antialiased">
      <NavBar />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <WhyItMattersSection />
        <ContactSection />
        <TechBadgesSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}

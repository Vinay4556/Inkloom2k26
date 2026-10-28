import Link from "next/link";
import { ShieldCheckIcon, FileTextIcon, BookOpenIcon, HistoryIcon, ArrowRightIcon } from "@/components/Icons";

export function HeroContent() {
  return (
    <section
      className="relative z-10 min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-4xl mx-auto">
          <p className="mb-6 text-sm font-medium text-[#6BA37A] tracking-wider uppercase animate-fade-in">
            Brand Intelligence Engine
          </p>
          <h1
            id="hero-heading"
            className="mb-8 text-5xl sm:text-6xl lg:text-7xl font-heading font-semibold text-white tracking-tight leading-[1.1] animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Every brand decision, backed by evidence
          </h1>
          <p className="mb-10 text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Define your brand standards once. Review content against clear, consistent rules. Give your team the evidence to make better decisions, with people always in control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/dashboard/content-review"
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white text-foreground font-medium text-base hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f] transition-all"
            >
              Try the demo
              <ArrowRightIcon className="w-5 h-5 ml-2 inline-block" aria-hidden="true" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-lg border border-white/20 text-white font-medium text-base hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f] transition-all"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/65 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Deterministic rule matching · Evidence-backed findings · Human review required
          </p>
          <p className="mt-2 text-xs text-white/50 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Demo features Morrow Goods, a fictional brand with illustrative rules
          </p>
        </div>
      </div>
    </section>
  );
}

export function ProductSection() {
  const features = [
    {
      icon: BookOpenIcon,
      title: "Brand Guidelines as Code",
      description:
        "Upload your brand guidelines — tone, restricted phrases, absolute claims, terminology. Inkloom extracts structured, versioned rules you can audit and edit.",
    },
    {
      icon: FileTextIcon,
      title: "Deterministic Content Review",
      description:
        "Paste copy or connect content sources. The engine matches text against your rules — case-insensitive phrase detection with stable rule IDs, severity levels, and explanations.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Human-Led Decisions",
      description:
        "No auto-approval. Every review surfaces findings with matched phrases, rule context, and suggestions. A qualified reviewer makes the final call. Audit trail included.",
    },
    {
      icon: HistoryIcon,
      title: "Review History & Compliance",
      description:
        "Track every decision — content, rules applied, findings, reviewer, timestamp. Filter by date, brand, outcome. Export for audits. Not implemented in this demo.",
    },
  ];

  return (
    <section
      id="product"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background"
      aria-labelledby="product-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2
            id="product-heading"
            className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-foreground tracking-tight"
          >
            Built for brand governance, not content generation
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Three pillars. One workflow. Zero hallucinations.
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-xl bg-surface border border-border p-6 sm:p-8 transition-all hover:border-accent/30 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6" ariaHidden={true} />
              </div>
              <h3 className="mb-3 text-xl font-heading font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Define rules",
      description:
        "Upload brand guidelines (PDF, DOCX, text). Inkloom parses them into structured rules: tone, restricted phrases, absolute claims, vague superlatives, terminology. Rules are versioned and editable.",
    },
    {
      number: "02",
      title: "Submit content",
      description:
        "Paste copy directly, upload files, or connect via API (not in demo). The review engine runs deterministic string matching against every configured rule — no LLM, no network calls for analysis.",
    },
    {
      number: "03",
      title: "Review findings",
      description:
        "Each match returns: rule ID, severity, matched phrase, explanation, and suggestion. Findings are grouped by type. No auto-approval — a human reviewer decides. Results are not persisted in this demo.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-surface border-y border-border"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2
            id="how-heading"
            className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-foreground tracking-tight"
          >
            How it works
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Three steps from guidelines to governed content.
          </p>
        </header>

        <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step) => (
            <article
              key={step.title}
              className="relative lg:pl-12 lg:border-l lg:border-border"
            >
              <div className="mb-4 flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-heading font-bold text-accent/20">
                  {step.number}
                </span>
                <h3 className="text-2xl font-heading font-semibold text-foreground">
                  {step.title}
                </h3>
              </div>
              <p className="text-muted leading-relaxed lg:pr-4">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoSection() {
  return (
    <section
      id="demo"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background"
      aria-labelledby="demo-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2
            id="demo-heading"
            className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-foreground tracking-tight"
          >
            Try the Morrow Goods demo
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            A fictional home-goods brand with three rule categories. Test the three sample cases or paste your own copy.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="space-y-6">
            <div className="rounded-xl bg-surface border border-border p-6 sm:p-8">
              <h3 className="mb-2 text-lg font-heading font-semibold text-foreground">
                Demo brand: Morrow Goods (fictional)
              </h3>
              <p className="mb-6 text-muted text-sm">
                Illustrative rules for a fictional brand. Not verified facts about a real company.
              </p>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-foreground">Tone</dt>
                  <dd className="mt-1 text-muted">Warm, clear, and practical.</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Absolute claims (Error)</dt>
                  <dd className="mt-1 text-muted">Flags &ldquo;100% sustainable&rdquo;, &ldquo;zero impact&rdquo;, &ldquo;completely eco-friendly&rdquo;, etc.</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Restricted phrases (Error)</dt>
                  <dd className="mt-1 text-muted">Flags &ldquo;guaranteed&rdquo;, &ldquo;miracle&rdquo;, &ldquo;risk-free&rdquo; for mandatory human review.</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Vague superlatives (Warning)</dt>
                  <dd className="mt-1 text-muted">Flags &ldquo;best in class&rdquo;, &ldquo;world-class&rdquo;, &ldquo;unparalleled&rdquo;, &ldquo;revolutionary&rdquo;, etc.</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 17v-4" />
                </svg>
                <div>
                  <p className="font-medium text-amber-800">Human review required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    This demo only checks specific configured rules. It does not verify factual claims, legal compliance, brand voice consistency, or accessibility. A qualified human reviewer must approve all content before publication.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-surface border border-border p-6 sm:p-8">
            <Link
              href="/dashboard/content-review"
              className="block w-full"
            >
              <button
                className="w-full px-6 py-4 rounded-lg bg-accent text-accent-foreground font-medium text-base hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors flex items-center justify-center gap-2"
              >
                Open Content Review Demo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <p className="mt-4 text-center text-sm text-muted">
              Opens the working review engine with three sample cases
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <DemoSampleCard
                title="Compliant"
                description="Organic cotton throw with specific, measurable claims"
                expectation="No rules triggered"
              />
              <DemoSampleCard
                title="Restricted phrases"
                description="Cleaning spray with guaranteed, miracle, risk-free"
                expectation="3 errors detected"
              />
              <DemoSampleCard
                title="Absolute claim"
                description="Kitchen set claiming 100% sustainable, zero impact"
                expectation="Multiple errors"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoSampleCard({ title, description, expectation }: { title: string; description: string; expectation: string }) {
  return (
    <div className="rounded-lg bg-background border border-border p-4 text-center">
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="mt-1 text-xs text-muted">{description}</p>
      <p className="mt-2 text-xs text-accent font-medium">{expectation}</p>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface border-t border-border" role="contentinfo">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg
              className="w-6 h-6 text-accent"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 26C10.477 28 6 23.523 6 16S10.477 4 16 4s14 4.477 14 10-4.477 14-14 14z"
                fill="currentColor"
              />
              <path
                d="M16 8c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"
                fill="#f8f7f4"
              />
            </svg>
            <span>Inkloom</span>
          </div>
          <p className="text-sm text-muted">
            Evidence-backed brand governance & content review. Demo uses deterministic rules — not AI.
          </p>
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link href="#product" className="text-sm text-muted hover:text-foreground transition-colors">
              Product
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/dashboard/content-review" className="text-sm text-muted hover:text-foreground transition-colors">
              Try the demo
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

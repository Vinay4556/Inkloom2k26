"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BookOpenIcon,
  ShieldCheckIcon,
  FileTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/Icons";

/* ---------- Hero Content ---------- */

export function KineticHeroContent() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section
      className="relative z-10 flex min-h-[100vh] items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          {/* Small eyebrow */}
          <div
            className={`mb-8 inline-flex items-center gap-2 rounded-full border border-[#6BA37A]/15 bg-[#6BA37A]/5 px-4 py-1.5 backdrop-blur-sm transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <span className="text-sm font-medium tracking-wide text-[#6BA37A]">
              BRAND CONSISTENCY PLATFORM
            </span>
          </div>
          
          {/* Main headline - intentionally simple to not compete with 3D */}
          <h1
            id="hero-heading"
            className={`mb-8 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-white transition-all duration-1200 sm:text-5xl lg:text-6xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Turn brand chaos
            <br />
            into consistent voice
            <br />
            built on <span className="text-[#6BA37A]">trust and evidence</span>
          </h1>
          
          {/* Supporting copy */}
          <p
            className={`mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/70 transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            Define your brand voice once. Review every piece of content against clear,
            consistent rules. Give your team evidence to make better decisions.
          </p>
          
          {/* CTAs */}
          <div
            className={`flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <Link
              href="/dashboard/content-review"
              className="group relative w-full overflow-hidden rounded-xl bg-[#6BA37A] px-8 py-4 font-medium text-[#0d100f] shadow-lg shadow-[#6BA37A]/20 transition-all hover:shadow-xl hover:shadow-[#6BA37A]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA37A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f] sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Try the demo
                <ArrowRightIcon
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  ariaHidden
                />
              </span>
              <div className="absolute inset-0 bg-[#7BB88A] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            
            <Link
              href="#problem"
              className="group w-full rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f] sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                See how it works
                <span className="transition-transform group-hover:translate-y-1">↓</span>
              </span>
            </Link>
          </div>
          
          {/* Scroll indicator */}
          <div
            className={`mt-20 flex justify-center transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-5 rounded-full border border-white/20 p-0.5">
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6BA37A] mx-auto"
                  style={{ animationDuration: "2.5s" }}
                />
              </div>
              <span className="text-xs tracking-wider text-white/35">SCROLL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Problem Section ---------- */

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="relative z-10 border-t border-white/5 bg-gradient-to-b from-[#0d100f] to-[#0a0c0a] px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          {/* Typographic problem visualization */}
          <div className="mb-12 overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-4 font-heading text-2xl font-semibold text-white/30 sm:text-3xl lg:text-4xl">
              <span className="translate-x-[-20px] rotate-[-8deg] opacity-70">Brand</span>
              <span className="translate-y-[15px] rotate-[5deg] opacity-50">voice</span>
              <span className="translate-x-[25px] translate-y-[-10px] rotate-[-12deg] opacity-60">scattered</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 font-heading text-xl font-medium text-white/20 sm:text-2xl">
              <span className="translate-x-[15px] rotate-[6deg]">inconsistent</span>
              <span className="translate-y-[8px] rotate-[-4deg]">tone</span>
              <span className="translate-x-[-12px] translate-y-[-6px] rotate-[7deg]">unverified</span>
            </div>
          </div>
          
          <h2
            id="problem-heading"
            className="mb-6 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Every team faces the same challenge
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted">
            Content comes from everywhere—drafts, agencies, internal teams, contractors. Each source brings its own voice, terminology, and claims. Without structure, your brand becomes whatever was written last.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Brand Rule Section ---------- */

export function BrandRuleSection() {
  return (
    <section
      id="brand-rules"
      className="relative z-10 border-y border-border bg-surface px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="rules-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left: Aligned typography */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Typographic alignment visualization */}
              <div className="space-y-3 rounded-2xl border border-accent/20 bg-accent/5 p-8">
                <div className="h-2 w-3/4 rounded bg-accent/40" />
                <div className="h-2 w-full rounded bg-accent/30" />
                <div className="h-2 w-5/6 rounded bg-accent/30" />
                <div className="mt-6 h-2 w-2/3 rounded bg-accent/40" />
                <div className="h-2 w-4/5 rounded bg-accent/30" />
                <div className="mt-6 h-3 w-1/2 rounded bg-accent/50" />
              </div>
            </div>
          </div>
          
          {/* Right: Content */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              BRAND STRUCTURE
            </div>
            
            <h2
              id="rules-heading"
              className="mb-6 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              Codify your brand voice
              <br />
              <span className="text-accent">into enforceable rules</span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted">
              Transform your brand guidelines from a PDF into structured, versioned rules. Every tone preference, restricted phrase, and terminology standard becomes a verifiable checkpoint.
            </p>
            
            <div className="space-y-4">
              <RuleFeature
                icon={<BookOpenIcon className="h-5 w-5" ariaHidden />}
                title="Structured guidelines"
                description="Upload documents, extract rules automatically"
              />
              <RuleFeature
                icon={<ShieldCheckIcon className="h-5 w-5" ariaHidden />}
                title="Version control"
                description="Track every change with audit trail"
              />
              <RuleFeature
                icon={<FileTextIcon className="h-5 w-5" ariaHidden />}
                title="Rule categories"
                description="Tone, phrases, claims, terminology"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RuleFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

/* ---------- Validation Section ---------- */

export function ValidationSection() {
  return (
    <section
      id="validation"
      className="relative z-10 border-b border-border bg-background px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="validation-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2
          id="validation-heading"
          className="mb-6 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          <span className="text-accent">Deterministic matching.</span>
          <br />
          Human decisions.
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted">
          The engine matches text against your rules using case-insensitive phrase detection. Every finding surfaces the matched phrase, rule context, severity, and suggested fix. No AI guessing. No hallucinations. A qualified reviewer makes the final call.
        </p>
        
        <div className="grid gap-6 sm:grid-cols-3">
          <ValidationCard
            number="01"
            title="Submit content"
            description="Paste copy, upload files, or connect via API"
          />
          <ValidationCard
            number="02"
            title="Match rules"
            description="Engine evaluates every configured guideline"
          />
          <ValidationCard
            number="03"
            title="Review findings"
            description="Human reviewer decides based on evidence"
          />
        </div>
      </div>
    </section>
  );
}

function ValidationCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 text-left transition-all hover:border-accent/30 hover:shadow-lg">
      <div className="mb-4 text-3xl font-bold text-accent/20">{number}</div>
      <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

/* ---------- Product Demo Section ---------- */

export function ProductDemoSection() {
  return (
    <section
      id="demo"
      className="relative z-10 border-b border-border bg-surface px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="demo-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2
            id="demo-heading"
            className="mb-6 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Try the Morrow Goods demo
          </h2>
          <p className="text-lg leading-relaxed text-muted">
            A fictional home-goods brand with three rule categories. Test the sample cases or paste your own content.
          </p>
        </div>
        
        <div className="rounded-2xl border border-border bg-background p-8 sm:p-10">
          <Link href="/dashboard/content-review" className="block">
            <button
              className="mb-6 w-full rounded-xl bg-accent px-8 py-5 font-medium text-accent-foreground transition-all hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="flex items-center justify-center gap-2 text-lg">
                Open Content Review Demo
                <ArrowRightIcon className="h-6 w-6" ariaHidden />
              </span>
            </button>
          </Link>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <DemoCard
              title="Compliant"
              description="Organic cotton throw"
              result="✓ No rules triggered"
              resultColor="text-accent"
            />
            <DemoCard
              title="Restricted phrases"
              description="Cleaning spray"
              result="✗ 3 errors detected"
              resultColor="text-error"
            />
            <DemoCard
              title="Absolute claim"
              description="Kitchen set"
              result="✗ Multiple errors"
              resultColor="text-error"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoCard({
  title,
  description,
  result,
  resultColor,
}: {
  title: string;
  description: string;
  result: string;
  resultColor: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-center">
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="mb-3 text-xs text-muted">{description}</p>
      <p className={`text-xs font-medium ${resultColor}`}>{result}</p>
    </div>
  );
}

/* ---------- Final Section ---------- */

export function FinalSection() {
  return (
    <section
      className="relative z-10 overflow-hidden bg-gradient-to-b from-background to-[#0d100f] px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="final-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Resolved typography visualization */}
        <div className="mb-12">
          <div className="font-heading text-2xl font-semibold text-white/90 sm:text-3xl lg:text-4xl">
            <span className="tracking-tight">BRAND VOICE</span>
          </div>
          <div className="mt-2 font-heading text-3xl font-bold text-[#6BA37A] sm:text-4xl lg:text-5xl">
            <span className="tracking-tight">TRUST</span>
          </div>
        </div>
        
        <h2
          id="final-heading"
          className="mb-6 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          Make every piece of content
          <br />
          sound like your brand
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted">
          Start with clear rules. Review with evidence. Decide with confidence.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/dashboard/content-review"
            className="group relative w-full overflow-hidden rounded-xl bg-accent px-10 py-5 font-medium text-accent-foreground shadow-xl shadow-accent/20 transition-all hover:shadow-2xl hover:shadow-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
              Try the demo
              <ArrowRightIcon
                className="h-6 w-6 transition-transform group-hover:translate-x-1"
                ariaHidden
              />
            </span>
            <div className="absolute inset-0 bg-accent-hover opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

export function KineticFooter() {
  return (
    <footer
      className="relative z-10 border-t border-border bg-[#0a0c0a] px-4 py-16 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2.5 font-heading text-xl font-semibold text-white"
            >
              <svg
                className="h-8 w-8 text-accent"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="16" r="6" fill="#f8f7f4" />
              </svg>
              Inkloom
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              Evidence-backed brand governance. Deterministic rule matching. Human review required.
            </p>
          </div>
          
          {/* Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
                Product
              </h3>
              <nav className="flex flex-col gap-3" aria-label="Product links">
                <Link
                  href="#problem"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  How it works
                </Link>
                <Link
                  href="#brand-rules"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  Brand rules
                </Link>
                <Link
                  href="#validation"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  Validation
                </Link>
              </nav>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
                Try it
              </h3>
              <nav className="flex flex-col gap-3" aria-label="Demo links">
                <Link
                  href="/dashboard/content-review"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  Content review
                </Link>
                <Link
                  href="/dashboard/brand-guidelines"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  Brand guidelines
                </Link>
                <Link
                  href="/dashboard/review-history"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  Review history
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-center text-xs text-white/40 sm:text-left">
              Demo features Morrow Goods, a fictional brand with illustrative rules.
            </p>
            <p className="text-center text-xs text-white/40 sm:text-right">
              Website by{" "}
              <span className="font-semibold text-accent">NEURAL NETWORK</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

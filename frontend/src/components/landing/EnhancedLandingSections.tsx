"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  FileTextIcon,
  BookOpenIcon,
  HistoryIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LayersIcon,
  ZapIcon,
  SearchIcon,
} from "@/components/Icons";

/* ---------- Hero Content ---------- */

export function EnhancedHeroContent() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section
      className="relative z-10 flex min-h-[100vh] items-center justify-center px-4 pt-20 sm:px-6 lg:px-8"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-5xl text-center">
          {/* Eyebrow */}
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border border-[#6BA37A]/20 bg-[#6BA37A]/5 px-4 py-1.5 backdrop-blur-sm transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6BA37A] opacity-75" style={{ animationDuration: "2s" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6BA37A]" />
            </span>
            <span className="text-sm font-medium tracking-wide text-[#6BA37A]">
              THE LIVING BRAND UNIVERSE
            </span>
          </div>
          
          {/* Main Headline */}
          <h1
            id="hero-heading"
            className={`mb-6 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-white transition-all duration-1000 sm:text-6xl lg:text-7xl xl:text-8xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            Your brand has a voice.
            <br />
            <span className="bg-gradient-to-r from-white via-[#f8f7f4] to-[#6BA37A] bg-clip-text text-transparent">
              Make every word sound like it.
            </span>
          </h1>
          
          {/* Supporting copy */}
          <p
            className={`mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-white/75 transition-all duration-1000 sm:text-xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Inkloom helps you review content against your brand guidelines, catch
            inconsistencies, and keep every message true to your identity—backed by
            evidence, governed by rules, decided by humans.
          </p>
          
          {/* CTAs */}
          <div
            className={`flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <Link
              href="/dashboard/content-review"
              className="group relative w-full overflow-hidden rounded-xl bg-white px-8 py-4 font-medium text-[#20231f] shadow-lg shadow-white/10 transition-all hover:shadow-xl hover:shadow-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f] sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Inkloom
                <ArrowRightIcon
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  ariaHidden
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white to-[#f8f7f4] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            
            <Link
              href="#transformation"
              className="group w-full rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f] sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                See how it works
                <span className="transition-transform group-hover:translate-y-1">↓</span>
              </span>
            </Link>
          </div>
          
          {/* Trust markers */}
          <div
            className={`mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50 transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-[#6BA37A]" ariaHidden />
              Deterministic matching
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-[#6BA37A]" ariaHidden />
              Evidence-backed findings
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-[#6BA37A]" ariaHidden />
              Human review required
            </span>
          </div>
          
          {/* Scroll indicator */}
          <div
            className={`mt-16 flex justify-center transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-6 rounded-full border-2 border-white/20 p-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#6BA37A] mx-auto" style={{ animationDuration: "2s" }} />
              </div>
              <span className="text-xs text-white/40">Scroll to explore</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Transformation Section ---------- */

export function TransformationSection() {
  return (
    <section
      id="transformation"
      className="relative z-10 border-t border-white/5 bg-gradient-to-b from-[#0d100f] via-[#0f110e] to-background px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="transformation-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            id="transformation-heading"
            className="mb-6 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Turn scattered ideas into
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              a consistent brand
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Content flows in messy and unstructured. Your brand guidelines transform
            it into something coherent, consistent, and unmistakably yours.
          </p>
        </div>
        
        {/* Visual flow representation */}
        <div className="mt-20 grid gap-8 lg:grid-cols-3 lg:gap-12">
          <FlowCard
            icon={<LayersIcon className="h-8 w-8" ariaHidden />}
            title="Raw Content"
            description="Ideas, drafts, and messages arrive from multiple sources—scattered, unrefined, and unverified."
            delay="0ms"
          />
          <FlowCard
            icon={<ZapIcon className="h-8 w-8" ariaHidden />}
            title="Rule Matching"
            description="Deterministic engine evaluates every word against your configured brand rules—no guessing, no AI hallucinations."
            delay="100ms"
            highlight
          />
          <FlowCard
            icon={<CheckCircleIcon className="h-8 w-8" ariaHidden />}
            title="Brand-Consistent Output"
            description="Reviewed content that sounds like your brand—every time, with evidence to back every decision."
            delay="200ms"
          />
        </div>
      </div>
    </section>
  );
}

function FlowCard({
  icon,
  title,
  description,
  delay,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-8 transition-all duration-500 hover:scale-105 ${
        highlight
          ? "border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg shadow-accent/10"
          : "border-border bg-surface hover:border-accent/20 hover:shadow-xl"
      }`}
      style={{ animationDelay: delay }}
    >
      <div
        className={`mb-5 inline-flex items-center justify-center rounded-xl p-3 ${
          highlight ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent"
        }`}
      >
        {icon}
      </div>
      <h3 className="mb-3 font-heading text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="leading-relaxed text-muted">{description}</p>
      
      {/* Decorative corner accent */}
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100 ${
        highlight ? "bg-accent" : "bg-accent/50"
      }`} />
    </div>
  );
}

/* ---------- Brand Intelligence Section ---------- */

export function BrandIntelligenceSection() {
  const intelligenceFeatures = [
    {
      icon: <BookOpenIcon className="h-6 w-6" ariaHidden />,
      title: "Brand Voice",
      description: "Define tone, terminology, and messaging patterns unique to your brand.",
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" ariaHidden />,
      title: "Compliance Rules",
      description: "Flag restricted phrases, absolute claims, and regulatory red flags.",
    },
    {
      icon: <SearchIcon className="h-6 w-6" ariaHidden />,
      title: "Evidence Trail",
      description: "Every finding links to the rule, matched phrase, and suggested fix.",
    },
    {
      icon: <LayersIcon className="h-6 w-6" ariaHidden />,
      title: "Rule Versioning",
      description: "Track changes to guidelines over time with complete audit history.",
    },
  ];
  
  return (
    <section
      id="brand-intelligence"
      className="relative z-10 border-y border-border bg-background px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="intelligence-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-sm font-medium text-accent mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              BRAND INTELLIGENCE
            </div>
            
            <h2
              id="intelligence-heading"
              className="mb-6 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            >
              Your guidelines,
              <br />
              <span className="text-accent">built to scale</span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted">
              Transform PDFs and documents into structured, enforceable rules. Every
              guideline becomes a verifiable checkpoint that content must pass.
            </p>
            
            <Link
              href="/dashboard/brand-guidelines"
              className="inline-flex items-center gap-2 font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Explore brand guidelines
              <ArrowRightIcon className="h-5 w-5" ariaHidden />
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {intelligenceFeatures.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/30 hover:shadow-lg"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-accent/10 p-2.5 text-accent">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Product Showcase (from existing) ---------- */

export function ProductShowcaseSection() {
  return (
    <section
      id="product"
      className="relative z-10 border-b border-border bg-surface px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="product-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-20 max-w-4xl text-center">
          <h2
            id="product-heading"
            className="mb-6 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Built for{" "}
            <span className="text-accent">brand governance</span>,
            <br />
            not content generation
          </h2>
          <p className="text-lg leading-relaxed text-muted sm:text-xl">
            Three pillars. One workflow. Zero hallucinations.
          </p>
        </header>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ProductFeatureCard
            icon={<BookOpenIcon className="h-7 w-7" ariaHidden />}
            title="Brand Guidelines as Code"
            description="Upload your brand guidelines — tone, restricted phrases, absolute claims, terminology. Inkloom extracts structured, versioned rules you can audit and edit."
            delay="0ms"
          />
          <ProductFeatureCard
            icon={<FileTextIcon className="h-7 w-7" ariaHidden />}
            title="Deterministic Content Review"
            description="Paste copy or connect content sources. The engine matches text against your rules — case-insensitive phrase detection with stable rule IDs, severity levels, and explanations."
            delay="100ms"
          />
          <ProductFeatureCard
            icon={<ShieldCheckIcon className="h-7 w-7" ariaHidden />}
            title="Human-Led Decisions"
            description="No auto-approval. Every review surfaces findings with matched phrases, rule context, and suggestions. A qualified reviewer makes the final call. Audit trail included."
            delay="200ms"
          />
        </div>
      </div>
    </section>
  );
}

function ProductFeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-background p-8 transition-all hover:border-accent/30 hover:shadow-xl"
      style={{ animationDelay: delay }}
    >
      <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-accent/10 p-3 text-accent transition-all group-hover:bg-accent/20 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-4 font-heading text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="leading-relaxed text-muted">{description}</p>
      
      {/* Hover accent */}
      <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-accent/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
    </article>
  );
}

/* ---------- Final CTA Section ---------- */

export function FinalCTASection() {
  return (
    <section
      className="relative z-10 overflow-hidden border-b border-border bg-gradient-to-b from-background to-[#0d100f] px-4 py-32 sm:px-6 sm:py-40 lg:px-8"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2
          id="cta-heading"
          className="mb-6 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          Make every piece of content
          <br />
          <span className="bg-gradient-to-r from-accent via-accent-hover to-accent bg-clip-text text-transparent">
            unmistakably yours
          </span>
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Try the Morrow Goods demo with real rules, real findings, and a real review workflow—no signup required.
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
          
          <Link
            href="/dashboard/brand-guidelines"
            className="w-full rounded-xl border border-border bg-surface px-10 py-5 text-lg font-medium text-foreground transition-all hover:border-accent/30 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
          >
            View brand guidelines
          </Link>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
    </section>
  );
}

/* ---------- Enhanced Footer ---------- */

export function EnhancedFooter() {
  return (
    <footer
      className="relative z-10 border-t border-border bg-[#0d100f] px-4 py-16 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 font-heading text-xl font-semibold text-white"
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
              Evidence-backed brand governance and content review. Transform guidelines
              into enforceable rules. Demo uses deterministic matching—not AI.
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
                  href="#transformation"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  How it works
                </Link>
                <Link
                  href="#brand-intelligence"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  Brand intelligence
                </Link>
                <Link
                  href="#product"
                  className="text-sm text-white/60 transition-colors hover:text-accent"
                >
                  Features
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
                  Content review demo
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
        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/40">
            Demo features Morrow Goods, a fictional brand with illustrative rules. Human review required for all content.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import dynamic from "next/dynamic";
import {
  KineticHeroContent,
  ProblemSection,
  BrandRuleSection,
  ValidationSection,
  ProductDemoSection,
  FinalSection,
  KineticFooter,
} from "@/components/landing/KineticLandingSections";
import { Navigation } from "@/components/landing/Navigation";
import { HeroSceneLoading } from "@/components/landing/HeroFallback";

const KineticHeroScene = dynamic(
  () => import("@/components/landing/KineticHeroScene").then((mod) => mod.KineticHeroScene),
  {
    ssr: false,
    loading: () => <HeroSceneLoading />,
  }
);

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#0d100f]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Navigation */}
      <Navigation />
      
      {/* Kinetic 3D Typography Background (Fixed) */}
      <KineticHeroScene />
      
      {/* Hero Content (Scrollable) */}
      <KineticHeroContent />
      
      {/* Main Content Sections */}
      <main id="main-content" className="relative z-10">
        <ProblemSection />
        <BrandRuleSection />
        <ValidationSection />
        <ProductDemoSection />
        <FinalSection />
      </main>
      
      {/* Footer */}
      <KineticFooter />
    </div>
  );
}

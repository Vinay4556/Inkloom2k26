/**
 * Static, CSS-only hero artwork. Used while the WebGL scene loads, when WebGL is unavailable,
 * when the scene errors, and under reduced-motion contexts where no canvas is created.
 * Deliberately has no Three.js imports so it stays in the main bundle.
 */
export function HeroSceneFallback({ animated = true }: { animated?: boolean }) {
  return (
    <div className="hero-fallback" aria-hidden="true" data-animated={animated ? "true" : "false"}>
      <div className="hero-fallback__ink" />
      <div className="hero-fallback__sheet hero-fallback__sheet--a" />
      <div className="hero-fallback__sheet hero-fallback__sheet--b" />
      <div className="hero-fallback__sheet hero-fallback__sheet--c" />
      <div className="hero-fallback__grain" />
    </div>
  );
}

/** Same footprint as the live scene, shown while the WebGL chunk loads. */
export function HeroSceneLoading() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh] overflow-hidden bg-[#0d100f]" aria-hidden="true">
      <HeroSceneFallback />
    </div>
  );
}

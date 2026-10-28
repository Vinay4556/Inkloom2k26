export interface DemoBrand {
  id: string;
  name: string;
  description: string;
  isDemo: true;
  tone: string;
  rules: DemoRule[];
}

export interface DemoRule {
  id: string;
  type: "absolute-claim" | "restricted-phrase" | "vague-superlative";
  severity: "warning" | "error";
  patterns: string[];
  explanation: string;
  suggestion: string;
}

export const demoBrands: DemoBrand[] = [
  {
    id: "morrow-goods",
    name: "Morrow Goods",
    description: "Fictional demo brand — a home and lifestyle goods company. These rules are illustrative demo rules, not verified facts about a real company.",
    isDemo: true,
    tone: "Warm, clear, and practical.",
    rules: [
      {
        id: "absolute-environmental-claim",
        type: "absolute-claim",
        severity: "error",
        patterns: [
          "100% sustainable",
          "zero impact",
          "completely eco-friendly",
          "totally green",
          "fully carbon neutral",
          "100% biodegradable",
          "zero waste",
        ],
        explanation: "Absolute environmental claims like '100% sustainable' or 'zero impact' are difficult to substantiate and may mislead consumers. Regulatory guidance (e.g., FTC Green Guides, UK CMA) recommends specific, qualified claims instead.",
        suggestion: "Replace with specific, measurable claims (e.g., 'made with 80% recycled materials' or 'reduces packaging waste by 40%').",
      },
      {
        id: "restricted-phrases",
        type: "restricted-phrase",
        severity: "error",
        patterns: [
          "guaranteed",
          "miracle",
          "risk-free",
        ],
        explanation: "Words like 'guaranteed', 'miracle', and 'risk-free' imply absolute certainty that rarely exists in practice. These trigger mandatory human review per Morrow Goods policy.",
        suggestion: "Use qualified language (e.g., 'designed to reduce risk', 'clinically tested', 'backed by our warranty').",
      },
      {
        id: "vague-superlatives",
        type: "vague-superlative",
        severity: "warning",
        patterns: [
          "best in class",
          "world-class",
          "unparalleled",
          "unmatched",
          "revolutionary",
          "game-changing",
          "unbeatable",
        ],
        explanation: "Vague superlatives cannot be verified and may appear as puffery. Morrow Goods tone prefers specific, grounded language.",
        suggestion: "Replace with concrete differentiators (e.g., 'rated 4.8/5 by 2,000+ customers', 'uses 30% less energy than standard models').",
      },
    ],
  },
];

export function getDemoBrand(id: string): DemoBrand | undefined {
  return demoBrands.find((b) => b.id === id);
}

export function getDefaultDemoBrand(): DemoBrand {
  return demoBrands[0];
}
export enum VulnerabilityCategory {
  Security = 'Security',
  Performance = 'Performance',
  Logic = 'Logic',
  BestPractices = 'Best Practices',
}

export enum TrafficLightScore {
  Green = 'GREEN',
  Yellow = 'YELLOW',
  Red = 'RED',
}

export enum SeverityLevel {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Medium = 'MEDIUM',
  Low = 'LOW',
}

export interface Vulnerability {
  category: VulnerabilityCategory;
  severity: SeverityLevel;
  description: string;
  impact: string;
  remediation: string;
}

export interface GoodVibeCheck {
  check: string;
  passed: boolean;
}

export interface CodeReviewResult {
  overallScore: TrafficLightScore;
  // FIX: Renamed 'goodVes' to 'goodVibes' to match the Gemini API schema and fix type errors in components.
  goodVibes: GoodVibeCheck[];
  vulnerabilities: Vulnerability[];
}

export interface LeaderboardEntry {
  repoUrl: string;
  reviewCount: number;
  bugsFound: number;
  score: TrafficLightScore;
}
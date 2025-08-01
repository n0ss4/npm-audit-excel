export interface AuditReport {
  auditReportVersion: number;
  vulnerabilities: Record<string, Vulnerability>;
  metadata: Metadata;
}

export interface Vulnerability {
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  isDirect: boolean;
  via: Array<string | VulnerabilityDetail>;
  effects: string[];
  range: string;
  nodes: string[];
  fixAvailable: boolean | FixInfo;
}

export interface VulnerabilityDetail {
  source: number;
  name: string;
  dependency: string;
  title: string;
  url: string;
  severity: string;
  cwe: string[];
  cvss: {
    score: number;
    vectorString: string | null;
  };
  range: string;
}

export interface FixInfo {
  name: string;
  version: string;
  isSemVerMajor?: boolean;
}

export interface Metadata {
  vulnerabilities: {
    info: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
    total: number;
  };
  dependencies: {
    prod: number;
    dev: number;
    optional: number;
    peer: number;
    peerOptional: number;
    total: number;
  };
}

export interface ProcessedVulnerability {
  package: string;
  severity: string;
  isDirect: boolean;
  range: string;
  fixAvailable: boolean;
  fixVersion: string;
  fixPackage: string;
  isSemVerMajor: boolean;
  effectsCount: number;
  viaCount: number;
  cvssScore: number;
  vulnerabilityTitle: string;
  advisoryUrl: string;
  cwe: string;
  fixCommand: string;
  priorityScore: number;
  priorityCategory: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ReportOptions {
  input?: string;
  output?: string;
  language?: string;
  format?: 'excel' | 'json' | 'csv';
  verbose?: boolean;
}

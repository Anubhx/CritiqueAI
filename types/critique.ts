export type CritiqueMode =
  | 'quick_scan'
  | 'full_audit'
  | 'accessibility_only'
  | 'mobile_ux';

export type Severity = 'critical' | 'major' | 'minor' | 'suggestion';

export type IssueCategory = 'heuristic' | 'accessibility' | 'visual' | 'mobile';

export interface CritiqueIssue {
  id: string;
  category: IssueCategory;
  heuristic: string;
  severity: Severity;
  title: string;
  what: string;
  why: string;
  fix: string;
  location_hint: string;
}

export interface CritiqueReport {
  overall_score: number;
  summary: string;
  mode: CritiqueMode;
  issues: CritiqueIssue[];
  strengths: string[];
  priority_fix: string;
}

export interface StoredReport {
  id: string;
  report: CritiqueReport;
  image_url: string;
  created_at: string;
}

export type CritiqueStatus =
  | 'idle'
  | 'capturing'
  | 'uploading'
  | 'analyzing'
  | 'structuring'
  | 'done'
  | 'error';

export interface CritiqueError {
  type: 'url_capture' | 'image_invalid' | 'gemini_error' | 'rate_limit' | 'login_wall';
  message: string;
}

export interface UsageMetric {
  userId: string;
  organizationId: string;
  role: string;
  messageCount: number;
  tokensConsumed: number;
  creditsUsed: number;
  toolCallsCount: number;
  lastActive: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  toolName: string;
  risk: 'read' | 'write';
  status: 'pending' | 'confirmed' | 'executed' | 'failed';
  summary: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  timestamp: string;
}

export class UsageAndAuditStore {
  private auditLogs: AuditLogEntry[] = [];
  private metrics: Map<string, UsageMetric> = new Map();

  recordAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(fullEntry);
    if (this.auditLogs.length > 5000) {
      this.auditLogs.pop();
    }
    return fullEntry;
  }

  getAuditLogs(organizationId?: string, limit = 100): AuditLogEntry[] {
    if (!organizationId) return this.auditLogs.slice(0, limit);
    return this.auditLogs.filter((log) => log.organizationId === organizationId).slice(0, limit);
  }

  trackUsage(userId: string, orgId: string, role: string, credits: number, tokens = 0): void {
    const key = `${orgId}:${userId}`;
    const existing = this.metrics.get(key) || {
      userId,
      organizationId: orgId,
      role,
      messageCount: 0,
      tokensConsumed: 0,
      creditsUsed: 0,
      toolCallsCount: 0,
      lastActive: new Date().toISOString(),
    };

    existing.messageCount += 1;
    existing.creditsUsed += credits;
    existing.tokensConsumed += tokens;
    existing.lastActive = new Date().toISOString();
    this.metrics.set(key, existing);
  }

  getMetricsForOrg(orgId: string): UsageMetric[] {
    return Array.from(this.metrics.values()).filter((m) => m.organizationId === orgId);
  }
}

export const globalUsageAndAuditStore = new UsageAndAuditStore();

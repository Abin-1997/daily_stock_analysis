import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Check, ChevronDown, Copy, Workflow } from 'lucide-react';
import { historyApi } from '../../api/history';
import { formatUiText, UI_TEXT } from '../../i18n/uiText';
import type {
  ReportLanguage,
  RunDiagnosticComponent,
  RunDiagnosticComponentStatus,
  RunDiagnosticStatus,
  RunDiagnosticSummary,
} from '../../types/analysis';
import { normalizeReportLanguage } from '../../utils/reportLanguage';
import { Badge, Button, Card, StatusDot } from '../common';

interface ReportDiagnosticsProps {
  recordId?: number;
  summary?: RunDiagnosticSummary;
  language?: ReportLanguage;
  onOpenRunFlow?: (recordId: number) => void;
}

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>['variant']>;
type StatusTone = NonNullable<React.ComponentProps<typeof StatusDot>['tone']>;

const COMPONENT_ORDER = [
  'realtime_quote',
  'daily_data',
  'news',
  'llm',
  'notification',
  'history',
];

const TEXT = {
  zh: {
    eyebrow: '运行诊断',
    title: '运行状态',
    loading: '诊断加载中...',
    unavailable: '运行诊断暂不可用',
    noComponents: '暂无组件诊断',
    components: '关键链路',
    primaryReason: '主要原因',
    advanced: '高级字段',
    copy: '复制排障信息',
    copied: '已复制',
    scope: '抓取 / LLM / 保存 / 通知链路',
    trace: 'Trace',
    task: 'Task',
    query: 'Query',
    trigger: '触发来源',
    overall: {
      normal: '正常',
      degraded: '部分降级',
      failed: '失败',
      unknown: '未知',
    },
    component: {
      ok: '正常',
      degraded: '最近失败后已降级',
      failed: '失败',
      unknown: '未知',
      not_configured: '未配置',
      skipped: '已跳过',
    },
  },
  en: {
    eyebrow: 'RUN DIAGNOSTICS',
    title: 'Run Status',
    loading: 'Loading diagnostics...',
    unavailable: 'Diagnostics unavailable',
    noComponents: 'No component diagnostics',
    components: 'Key Path',
    primaryReason: 'Primary Reason',
    advanced: 'Advanced Fields',
    copy: 'Copy diagnostics',
    copied: 'Copied',
    scope: 'Fetch / LLM / save / notification path',
    trace: 'Trace',
    task: 'Task',
    query: 'Query',
    trigger: 'Trigger',
    overall: {
      normal: 'Normal',
      degraded: 'Degraded',
      failed: 'Failed',
      unknown: 'Unknown',
    },
    component: {
      ok: 'Normal',
      degraded: 'Recent failure',
      failed: 'Failed',
      unknown: 'Unknown',
      not_configured: 'Not configured',
      skipped: 'Skipped',
    },
  },
  ko: {
    eyebrow: '실행 진단',
    title: '실행 상태',
    loading: '진단 불러오는 중...',
    unavailable: '실행 진단을 사용할 수 없음',
    noComponents: '컴포넌트 진단 없음',
    components: '핵심 경로',
    primaryReason: '주요 사유',
    advanced: '고급 필드',
    copy: '진단 정보 복사',
    copied: '복사됨',
    scope: '수집 / LLM / 저장 / 알림 경로',
    trace: 'Trace',
    task: 'Task',
    query: 'Query',
    trigger: '트리거',
    overall: {
      normal: '정상',
      degraded: '부분 강등',
      failed: '실패',
      unknown: '알 수 없음',
    },
    component: {
      ok: '정상',
      degraded: '최근 실패 후 강등',
      failed: '실패',
      unknown: '알 수 없음',
      not_configured: '미설정',
      skipped: '건너뜀',
    },
  },
} as const;

const OVERALL_STATUS_STYLE: Record<RunDiagnosticStatus, { variant: BadgeVariant; tone: StatusTone }> = {
  normal: { variant: 'success', tone: 'success' },
  degraded: { variant: 'warning', tone: 'warning' },
  failed: { variant: 'danger', tone: 'danger' },
  unknown: { variant: 'default', tone: 'neutral' },
};

const COMPONENT_STATUS_STYLE: Record<RunDiagnosticComponentStatus, { variant: BadgeVariant; tone: StatusTone }> = {
  ok: { variant: 'success', tone: 'success' },
  degraded: { variant: 'warning', tone: 'warning' },
  failed: { variant: 'danger', tone: 'danger' },
  unknown: { variant: 'default', tone: 'neutral' },
  not_configured: { variant: 'default', tone: 'neutral' },
  skipped: { variant: 'default', tone: 'neutral' },
};

const DETAIL_ORDER = [
  'error_type',
  'provider',
  'fallback_to',
  'record_count',
  'attempts',
  'analysis_input_block',
  'analysis_input_status',
  'analysis_input_missing_reasons',
  'evidence_scope',
  'analysis_input_source',
  'model',
  'fallback_model',
  'tokens',
  'duration_ms',
  'channels',
  'failed',
  'analysis_history_id',
];

const DETAIL_LABELS: Record<ReportLanguage, Record<string, string>> = {
  zh: {
    provider: '数据源',
    attempts: '尝试',
    record_count: '记录数',
    fallback_to: '降级到',
    error_type: '错误类型',
    model: '模型',
    tokens: 'Tokens',
    duration_ms: '耗时',
    fallback_model: '切换模型',
    channels: '渠道',
    failed: '失败渠道',
    analysis_history_id: '历史 ID',
    analysis_input_block: '输入块',
    analysis_input_status: '输入状态',
    analysis_input_source: '输入来源',
    analysis_input_missing_reasons: '真实原因',
    evidence_scope: '证据范围',
  },
  en: {
    provider: 'Provider',
    attempts: 'Attempts',
    record_count: 'Records',
    fallback_to: 'Fallback To',
    error_type: 'Error Type',
    model: 'Model',
    tokens: 'Tokens',
    duration_ms: 'Duration',
    fallback_model: 'Fallback Model',
    channels: 'Channels',
    failed: 'Failed',
    analysis_history_id: 'History ID',
    analysis_input_block: 'Input Block',
    analysis_input_status: 'Input Status',
    analysis_input_source: 'Input Source',
    analysis_input_missing_reasons: 'Raw Reason',
    evidence_scope: 'Evidence Scope',
  },
  ko: {
    provider: '데이터 소스',
    attempts: '시도',
    record_count: '레코드',
    fallback_to: '강등 대상',
    error_type: '오류 유형',
    model: '모델',
    tokens: 'Tokens',
    duration_ms: '소요 시간',
    fallback_model: '전환 모델',
    channels: '채널',
    failed: '실패 채널',
    analysis_history_id: '이력 ID',
    analysis_input_block: '입력 블록',
    analysis_input_status: '입력 상태',
    analysis_input_source: '입력 출처',
    analysis_input_missing_reasons: '원인 코드',
    evidence_scope: '증거 범위',
  },
};

const DETAIL_VALUE_LABELS: Record<ReportLanguage, Record<string, string>> = {
  zh: {
    provider_run_vs_analysis_input: '数据源成功但未进分析输入',
    retrieval_vs_analysis_input: '检索结果未进分析输入',
    analysis_input_only: '仅记录分析输入状态',
  },
  en: {
    provider_run_vs_analysis_input: 'Provider succeeded but input excluded',
    retrieval_vs_analysis_input: 'Retrieved results excluded from input',
    analysis_input_only: 'Analysis input status only',
  },
  ko: {
    provider_run_vs_analysis_input: '소스 성공, 분석 입력 제외',
    retrieval_vs_analysis_input: '검색 결과가 입력에서 제외됨',
    analysis_input_only: '분석 입력 상태만 기록',
  },
};

const compactText = (value: string, maxLength = 92): string => {
  const text = value.trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
};

const compactId = (value?: string): string | null => {
  const text = (value || '').trim();
  if (!text) return null;
  if (text.length <= 28) return text;
  return `${text.slice(0, 10)}...${text.slice(-8)}`;
};

const getOrderedComponents = (
  components?: Record<string, RunDiagnosticComponent>,
): RunDiagnosticComponent[] => {
  const items = Object.values(components || {});
  const ordered = COMPONENT_ORDER
    .map((key) => items.find((component) => component.key === key))
    .filter((component): component is RunDiagnosticComponent => Boolean(component));
  const remaining = items.filter((component) => !COMPONENT_ORDER.includes(component.key));
  return [...ordered, ...remaining];
};

const formatDetailValue = (
  key: string,
  value: unknown,
  language: ReportLanguage,
): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 3);
    if (!items.length) {
      return null;
    }
    return items.join(', ');
  }
  if (typeof value === 'object') {
    return null;
  }
  if (key === 'duration_ms' && typeof value === 'number') {
    return `${value}ms`;
  }
  const raw = String(value).trim();
  return DETAIL_VALUE_LABELS[language][raw] || raw;
};

const normalizeDetailKey = (key: string): string => (
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
);

const getComponentDetailChips = (
  component: RunDiagnosticComponent,
  language: ReportLanguage,
): string[] => {
  const details = component.details || {};
  const normalizedDetails = Object.entries(details).reduce<Record<string, unknown>>(
    (result, [key, value]) => {
      const normalizedKey = normalizeDetailKey(key);
      if (
        !Object.prototype.hasOwnProperty.call(result, normalizedKey)
        || key === normalizedKey
      ) {
        result[normalizedKey] = value;
      }
      return result;
    },
    {},
  );
  const orderedKeys = [
    ...DETAIL_ORDER.filter((key) => Object.prototype.hasOwnProperty.call(normalizedDetails, key)),
    ...Object.keys(normalizedDetails).filter((key) => !DETAIL_ORDER.includes(key)).sort(),
  ];

  return orderedKeys
    .map((key) => {
      const value = formatDetailValue(key, normalizedDetails[key], language);
      if (!value) {
        return null;
      }
      const label = DETAIL_LABELS[language][key] || key;
      return `${label}: ${compactText(value, 52)}`;
    })
    .filter((chip): chip is string => Boolean(chip))
    .slice(0, 6);
};

/**
 * Collapsed report diagnostics for self-hosted troubleshooting.
 */
export const ReportDiagnostics: React.FC<ReportDiagnosticsProps> = ({
  recordId,
  summary,
  language = 'zh',
  onOpenRunFlow,
}) => {
  const reportLanguage = normalizeReportLanguage(language);
  const text = TEXT[reportLanguage];
  const runFlowText = UI_TEXT[reportLanguage === 'ko' ? 'en' : reportLanguage];
  const [fetchState, setFetchState] = useState<{
    recordId?: number;
    summary: RunDiagnosticSummary | null;
    failed: boolean;
  }>({
    summary: null,
    failed: false,
  });
  const [copied, setCopied] = useState(false);
  const resetCopiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (summary || !recordId) {
      return undefined;
    }

    let active = true;
    void historyApi.getDiagnostics(recordId)
      .then((result) => {
        if (active) {
          setFetchState({
            recordId,
            summary: result,
            failed: false,
          });
        }
      })
      .catch(() => {
        if (active) {
          setFetchState({
            recordId,
            summary: null,
            failed: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [recordId, summary]);

  useEffect(() => () => {
    if (resetCopiedTimerRef.current !== null) {
      window.clearTimeout(resetCopiedTimerRef.current);
    }
  }, []);

  const fetchedForRecord = recordId !== undefined && fetchState.recordId === recordId
    ? fetchState
    : null;
  const loadedSummary = summary ?? fetchedForRecord?.summary ?? null;
  const loadFailed = !summary && Boolean(fetchedForRecord?.failed);
  const isLoading = Boolean(recordId && !summary && !fetchedForRecord);

  const visibleSummary = useMemo<RunDiagnosticSummary | null>(() => {
    if (loadedSummary) {
      return loadedSummary;
    }
    if (!recordId && !summary) {
      return null;
    }
    if (!isLoading && !loadFailed) {
      return null;
    }
    return {
      status: 'unknown',
      statusLabel: text.overall.unknown,
      reason: loadFailed ? text.unavailable : text.loading,
      components: {},
      copyText: '',
    };
  }, [isLoading, loadFailed, loadedSummary, recordId, summary, text]);

  if (!visibleSummary) {
    return null;
  }

  const statusStyle = OVERALL_STATUS_STYLE[visibleSummary.status] || OVERALL_STATUS_STYLE.unknown;
  const statusLabel = text.overall[visibleSummary.status] || visibleSummary.statusLabel;
  const components = getOrderedComponents(visibleSummary.components);
  const traceId = compactId(visibleSummary.traceId);
  const taskId = compactId(visibleSummary.taskId);
  const queryId = compactId(visibleSummary.queryId);
  const hasCopyText = Boolean(visibleSummary.copyText && !isLoading);
  const advancedPayload = {
    traceId: visibleSummary.traceId,
    taskId: visibleSummary.taskId,
    queryId: visibleSummary.queryId,
    stockCode: visibleSummary.stockCode,
    triggerSource: visibleSummary.triggerSource,
    components: components.reduce<Record<string, Record<string, unknown>>>((payload, component) => {
      payload[component.key] = {
        status: component.status,
        message: component.message,
        details: component.details || {},
      };
      return payload;
    }, {}),
  };
  const hasAdvancedPayload = Boolean(
    visibleSummary.traceId
    || visibleSummary.taskId
    || visibleSummary.queryId
    || visibleSummary.stockCode
    || visibleSummary.triggerSource
    || components.some((component) => component.details && Object.keys(component.details).length > 0),
  );

  const copyDiagnostics = async () => {
    if (!hasCopyText || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(visibleSummary.copyText);
      setCopied(true);
      if (resetCopiedTimerRef.current !== null) {
        window.clearTimeout(resetCopiedTimerRef.current);
      }
      resetCopiedTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        resetCopiedTimerRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Copy diagnostics failed:', err);
    }
  };

  return (
    <Card variant="bordered" padding="none" className="home-panel-card text-left">
      <details data-testid="run-diagnostics" className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="label-uppercase">{text.eyebrow}</span>
              <span className="mt-0.5 block truncate text-base font-semibold text-foreground">
                {text.title}
              </span>
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-2">
            {isLoading ? (
              <span className="home-spinner h-3.5 w-3.5 animate-spin border-2" aria-hidden="true" />
            ) : null}
            <Badge variant={statusStyle.variant} className="gap-1.5 shadow-none">
              <StatusDot tone={statusStyle.tone} className="h-1.5 w-1.5" />
              {statusLabel}
            </Badge>
            <span className="hidden home-accent-chip px-2 py-0.5 text-xs text-muted-text md:inline-flex">
              {text.scope}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-text transition-transform group-open:rotate-180" aria-hidden="true" />
          </span>
        </summary>

        <div className="home-divider space-y-4 border-t px-4 pb-4 pt-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="home-subpanel flex max-w-full flex-wrap items-center gap-2 px-3 py-2">
                <span className="label-uppercase">{text.primaryReason}</span>
                <span className="min-w-0 text-sm leading-5 text-foreground" aria-label={visibleSummary.reason}>
                  {compactText(visibleSummary.reason)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-text">
                {traceId ? (
                  <span className="home-accent-chip px-2 py-0.5 font-mono">
                    {text.trace}: {traceId}
                  </span>
                ) : null}
                {taskId ? (
                  <span className="home-accent-chip px-2 py-0.5 font-mono">
                    {text.task}: {taskId}
                  </span>
                ) : null}
                {queryId ? (
                  <span className="home-accent-chip px-2 py-0.5 font-mono">
                    {text.query}: {queryId}
                  </span>
                ) : null}
                {visibleSummary.triggerSource ? (
                  <span className="home-accent-chip px-2 py-0.5">
                    {text.trigger}: {visibleSummary.triggerSource}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {recordId !== undefined && onOpenRunFlow ? (
                <Button
                  variant="ghost"
                  size="xsm"
                  onClick={() => onOpenRunFlow(recordId)}
                  aria-label={formatUiText(runFlowText['runFlow.openHistoryAria'], { recordId })}
                >
                  <Workflow className="h-3.5 w-3.5" aria-hidden="true" />
                  {runFlowText['runFlow.open']}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="xsm"
                disabled={!hasCopyText}
                onClick={() => void copyDiagnostics()}
                aria-label={copied ? text.copied : text.copy}
                className="shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? text.copied : text.copy}
              </Button>
            </div>
          </div>

          <div>
            <span className="label-uppercase">{text.components}</span>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              {components.length > 0 ? components.map((component) => {
                const componentStyle = COMPONENT_STATUS_STYLE[component.status] || COMPONENT_STATUS_STYLE.unknown;
                const componentLabel = text.component[component.status] || component.status;
                const detailChips = getComponentDetailChips(component, reportLanguage);
                return (
                  <div key={component.key} className="home-subpanel p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {component.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-secondary-text" aria-label={component.message}>
                          {compactText(component.message, 82)}
                        </p>
                      </div>
                      <Badge variant={componentStyle.variant} className="shrink-0 gap-1.5 shadow-none">
                        <StatusDot tone={componentStyle.tone} className="h-1.5 w-1.5" />
                        {componentLabel}
                      </Badge>
                    </div>
                    {detailChips.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] leading-5">
                        {detailChips.map((chip) => (
                          <span key={chip} className="home-accent-chip max-w-full px-2 py-0.5 text-muted-text">
                            {chip}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }) : (
                <p className="home-subpanel p-3 text-sm text-secondary-text">
                  {text.noComponents}
                </p>
              )}
            </div>
          </div>

          {hasAdvancedPayload ? (
            <details className="home-subpanel group/advanced p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{text.advanced}</span>
                <ChevronDown className="h-4 w-4 text-muted-text transition-transform group-open/advanced:rotate-180" aria-hidden="true" />
              </summary>
              <pre className="home-trace-pre home-trace-pre-content mt-3 max-h-80 overflow-auto rounded-lg bg-base p-3 text-left font-mono text-xs text-foreground">
                {JSON.stringify(advancedPayload, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>
      </details>
    </Card>
  );
};

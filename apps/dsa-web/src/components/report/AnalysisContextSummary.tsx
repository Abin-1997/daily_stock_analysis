import type React from 'react';
import { ChevronDown, Database } from 'lucide-react';
import type {
  AnalysisContextPackBlockStatus,
  AnalysisContextPackOverview,
  ReportLanguage,
} from '../../types/analysis';
import { normalizeReportLanguage } from '../../utils/reportLanguage';
import { Badge, Card, StatusDot } from '../common';
import { DashboardPanelHeader } from '../dashboard';

interface AnalysisContextSummaryProps {
  overview?: AnalysisContextPackOverview | null;
  language?: ReportLanguage;
}

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>['variant']>;
type StatusTone = NonNullable<React.ComponentProps<typeof StatusDot>['tone']>;

const STATUS_STYLE: Record<AnalysisContextPackBlockStatus, { variant: BadgeVariant; tone: StatusTone }> = {
  available: { variant: 'success', tone: 'success' },
  missing: { variant: 'danger', tone: 'danger' },
  not_supported: { variant: 'default', tone: 'neutral' },
  fallback: { variant: 'warning', tone: 'warning' },
  stale: { variant: 'warning', tone: 'warning' },
  estimated: { variant: 'info', tone: 'info' },
  partial: { variant: 'warning', tone: 'warning' },
  fetch_failed: { variant: 'danger', tone: 'danger' },
};

const QUALITY_STYLE = {
  good: { variant: 'success', tone: 'success' },
  usable: { variant: 'info', tone: 'info' },
  limited: { variant: 'warning', tone: 'warning' },
  poor: { variant: 'danger', tone: 'danger' },
} as const satisfies Record<string, { variant: BadgeVariant; tone: StatusTone }>;

const BLOCK_LABELS: Record<ReportLanguage, Record<string, string>> = {
  zh: {
    quote: '行情',
    daily_bars: '日线',
    technical: '技术',
    news: '新闻',
    fundamentals: '基本面',
    chip: '筹码',
  },
  en: {
    quote: 'quote',
    daily_bars: 'daily bars',
    technical: 'technical',
    news: 'news',
    fundamentals: 'fundamentals',
    chip: 'chip',
  },
  ko: {
    quote: '시세',
    daily_bars: '일봉',
    technical: '기술',
    news: '뉴스',
    fundamentals: '펀더멘털',
    chip: '매물대',
  },
};

const TEXT = {
  zh: {
    eyebrow: '数据上下文',
    title: '输入数据块',
    counts: '状态计数',
    source: '来源',
    sourceUnavailable: '未记录输入来源',
    warnings: '告警',
    missingReasons: '缺失原因',
    statusGuidance: '状态说明',
    diagnosticCodes: '诊断码',
    action: '处理',
    scope: '范围',
    inputScope: '本次分析输入',
    evidenceScope: '仅代表进入本次 LLM 的输入，不等同于数据源运行成功',
    qualityScore: '质量分',
    limitations: '数据限制',
    newsResultCount: '新闻结果数',
    triggerSource: '触发来源',
    qualityLevel: {
      good: '良好',
      usable: '可用',
      limited: '受限',
      poor: '较差',
    },
    status: {
      available: '可用',
      missing: '缺失',
      not_supported: '不支持',
      fallback: '降级',
      stale: '过期',
      estimated: '估算',
      partial: '部分可用',
      fetch_failed: '抓取失败',
    },
  },
  en: {
    eyebrow: 'DATA CONTEXT',
    title: 'Input Blocks',
    counts: 'Status Counts',
    source: 'Source',
    sourceUnavailable: 'Input source not recorded',
    warnings: 'Warnings',
    missingReasons: 'Missing Reasons',
    statusGuidance: 'Status Note',
    diagnosticCodes: 'Diagnostic Codes',
    action: 'Action',
    scope: 'Scope',
    inputScope: 'Analysis Input',
    evidenceScope: 'Shows inputs included in this LLM run, not provider run success',
    qualityScore: 'Quality',
    limitations: 'Data Limitations',
    newsResultCount: 'News Results',
    triggerSource: 'Trigger',
    qualityLevel: {
      good: 'Good',
      usable: 'Usable',
      limited: 'Limited',
      poor: 'Poor',
    },
    status: {
      available: 'Available',
      missing: 'Missing',
      not_supported: 'Not supported',
      fallback: 'Fallback',
      stale: 'Stale',
      estimated: 'Estimated',
      partial: 'Partial',
      fetch_failed: 'Fetch failed',
    },
  },
  ko: {
    eyebrow: '데이터 컨텍스트',
    title: '입력 데이터 블록',
    counts: '상태 카운트',
    source: '출처',
    sourceUnavailable: '입력 출처 기록 없음',
    warnings: '경고',
    missingReasons: '누락 사유',
    statusGuidance: '상태 안내',
    diagnosticCodes: '진단 코드',
    action: '조치',
    scope: '범위',
    inputScope: '이번 분석 입력',
    evidenceScope: '이번 LLM 입력에 포함된 항목만 표시하며, 데이터 소스 실행 성공과는 다릅니다',
    qualityScore: '품질 점수',
    limitations: '데이터 한계',
    newsResultCount: '뉴스 결과 수',
    triggerSource: '트리거',
    qualityLevel: {
      good: '양호',
      usable: '사용 가능',
      limited: '제한적',
      poor: '미흡',
    },
    status: {
      available: '사용 가능',
      missing: '누락',
      not_supported: '미지원',
      fallback: '강등',
      stale: '만료',
      estimated: '추정',
      partial: '부분 사용',
      fetch_failed: '수집 실패',
    },
  },
} as const;

const MISSING_REASON_LABELS: Record<ReportLanguage, Record<string, string>> = {
  zh: {
    daily_bars_missing: '日线未进入本次分析输入',
    news_context_missing: '新闻未进入本次分析输入',
    realtime_quote_missing: '实时行情未进入本次分析输入',
    trend_result_missing: '技术分析结果未进入本次分析输入',
    fundamental_context_missing: '基本面未进入本次分析输入',
    fundamental_pipeline_failed: '基本面抓取失败',
    chip_distribution_missing: '筹码数据未进入本次分析输入',
    today_missing: '今日数据未进入本次分析输入',
    yesterday_missing: '昨日数据未进入本次分析输入',
  },
  en: {
    daily_bars_missing: 'Daily bars were not included in this LLM input',
    news_context_missing: 'News was not included in this LLM input',
    realtime_quote_missing: 'Real-time quote was not included in this LLM input',
    trend_result_missing: 'Technical analysis result was not included in this LLM input',
    fundamental_context_missing: 'Fundamentals were not included in this LLM input',
    fundamental_pipeline_failed: 'Fundamental fetch failed',
    chip_distribution_missing: 'Chip distribution was not included in this LLM input',
    today_missing: 'Today data was not included in this LLM input',
    yesterday_missing: 'Yesterday data was not included in this LLM input',
  },
  ko: {
    daily_bars_missing: '일봉이 이번 LLM 입력에 포함되지 않았습니다',
    news_context_missing: '뉴스가 이번 LLM 입력에 포함되지 않았습니다',
    realtime_quote_missing: '실시간 시세가 이번 LLM 입력에 포함되지 않았습니다',
    trend_result_missing: '기술 분석 결과가 이번 LLM 입력에 포함되지 않았습니다',
    fundamental_context_missing: '펀더멘털이 이번 LLM 입력에 포함되지 않았습니다',
    fundamental_pipeline_failed: '펀더멘털 수집에 실패했습니다',
    chip_distribution_missing: '매물대 데이터가 이번 LLM 입력에 포함되지 않았습니다',
    today_missing: '당일 데이터가 이번 LLM 입력에 포함되지 않았습니다',
    yesterday_missing: '전일 데이터가 이번 LLM 입력에 포함되지 않았습니다',
  },
};

const MISSING_REASON_ACTIONS: Record<ReportLanguage, Record<string, string>> = {
  zh: {
    daily_bars_missing: '检查日线数据源/网络/限流后重跑',
    news_context_missing: '检查搜索配置/网络/限流后重跑',
    realtime_quote_missing: '检查行情数据源/网络/限流后重跑',
    trend_result_missing: '检查日线完整性后重跑',
    fundamental_context_missing: '检查基本面数据源/网络/限流后重跑',
    fundamental_pipeline_failed: '检查 provider 配置/网络/限流后重跑',
    chip_distribution_missing: '确认市场或标的支持筹码数据',
    today_missing: '结合实时行情复核后重跑',
    yesterday_missing: '等待日线数据源更新后重跑',
  },
  en: {
    daily_bars_missing: 'Check daily source/network/rate limits and rerun',
    news_context_missing: 'Check search config/network/rate limits and rerun',
    realtime_quote_missing: 'Check quote source/network/rate limits and rerun',
    trend_result_missing: 'Check daily bar completeness and rerun',
    fundamental_context_missing: 'Check fundamental source/network/rate limits and rerun',
    fundamental_pipeline_failed: 'Check provider config/network/rate limits and rerun',
    chip_distribution_missing: 'Confirm chip data supports this market or symbol',
    today_missing: 'Cross-check real-time quotes and rerun',
    yesterday_missing: 'Wait for daily source update and rerun',
  },
  ko: {
    daily_bars_missing: '일봉 소스/네트워크/제한 확인 후 재실행',
    news_context_missing: '검색 설정/네트워크/제한 확인 후 재실행',
    realtime_quote_missing: '시세 소스/네트워크/제한 확인 후 재실행',
    trend_result_missing: '일봉 완전성 확인 후 재실행',
    fundamental_context_missing: '펀더멘털 소스/네트워크/제한 확인 후 재실행',
    fundamental_pipeline_failed: 'provider 설정/네트워크/제한 확인 후 재실행',
    chip_distribution_missing: '시장 또는 종목의 매물대 지원 여부 확인',
    today_missing: '실시간 시세와 대조 후 재실행',
    yesterday_missing: '일봉 소스 갱신 후 재실행',
  },
};

const NEWS_SUPPLEMENTAL_SCOPE_LABELS: Record<ReportLanguage, string> = {
  zh: '相关资讯来自报告页补充/历史',
  en: 'Related news is supplemental/history',
  ko: '관련 뉴스는 보충/이력 출처',
};

const UNKNOWN_MISSING_REASON_LABELS: Record<ReportLanguage, string> = {
  zh: '未记录明确缺失原因',
  en: 'Missing reason was not recorded',
  ko: '명확한 누락 사유 기록 없음',
};

const STATUS_FALLBACK_GUIDANCE: Record<
  ReportLanguage,
  Partial<Record<AnalysisContextPackBlockStatus, string>>
> = {
  zh: {
    missing: '数据未进入本次分析输入',
    fetch_failed: '数据抓取失败，本次分析未使用该数据',
    not_supported: '当前市场或标的不支持该数据',
    fallback: '本次分析使用了降级数据路径',
    stale: '本次分析使用了非最新数据',
    estimated: '本次分析使用了估算数据',
    partial: '仅部分数据进入本次分析输入',
  },
  en: {
    missing: 'Data was not included in this analysis input',
    fetch_failed: 'Data retrieval failed and this analysis did not use the data',
    not_supported: 'This data is not supported for the current market or symbol',
    fallback: 'This analysis used a fallback data path',
    stale: 'This analysis used data that may not be current',
    estimated: 'This analysis used estimated data',
    partial: 'Only part of the data was included in this analysis input',
  },
  ko: {
    missing: '데이터가 이번 분석 입력에 포함되지 않았습니다',
    fetch_failed: '데이터 수집에 실패해 이번 분석에서 사용되지 않았습니다',
    not_supported: '현재 시장 또는 종목은 이 데이터를 지원하지 않습니다',
    fallback: '이번 분석은 강등 데이터 경로를 사용했습니다',
    stale: '이번 분석은 최신이 아닐 수 있는 데이터를 사용했습니다',
    estimated: '이번 분석은 추정 데이터를 사용했습니다',
    partial: '데이터의 일부만 이번 분석 입력에 포함되었습니다',
  },
};

const STATUS_FALLBACK_ACTIONS: Record<
  ReportLanguage,
  Partial<Record<AnalysisContextPackBlockStatus, string>>
> = {
  zh: {
    missing: '检查数据源/配置/网络后重跑',
    fetch_failed: '检查数据源/网络/限流后重跑',
    not_supported: '更换受支持的数据源或结合其他指标',
    fallback: '结合数据来源和告警复核降级结果',
    stale: '检查数据更新时间后按需重跑',
    estimated: '结合原始数据复核估算结果',
    partial: '检查告警和数据源后重跑',
  },
  en: {
    missing: 'Check the data source, configuration, and network, then rerun',
    fetch_failed: 'Check the data source, network, and rate limits, then rerun',
    not_supported: 'Use a supported data source or cross-check other indicators',
    fallback: 'Review the fallback result against its source and warnings',
    stale: 'Check the data timestamp and rerun if needed',
    estimated: 'Cross-check the estimate against the source data',
    partial: 'Check the warnings and data source, then rerun',
  },
  ko: {
    missing: '데이터 소스/설정/네트워크 확인 후 다시 실행',
    fetch_failed: '데이터 소스/네트워크/제한 확인 후 다시 실행',
    not_supported: '지원되는 데이터 소스를 사용하거나 다른 지표와 교차 확인',
    fallback: '데이터 출처와 경고를 기준으로 강등 결과 확인',
    stale: '데이터 갱신 시각 확인 후 필요하면 다시 실행',
    estimated: '원본 데이터와 추정 결과를 교차 확인',
    partial: '경고와 데이터 소스 확인 후 다시 실행',
  },
};

const STATUS_ORDER: AnalysisContextPackBlockStatus[] = [
  'available',
  'missing',
  'fetch_failed',
  'not_supported',
  'fallback',
  'stale',
  'estimated',
  'partial',
];

const getCount = (
  overview: AnalysisContextPackOverview,
  status: AnalysisContextPackBlockStatus,
): number => {
  if (status === 'not_supported') {
    return overview.counts.notSupported || 0;
  }
  if (status === 'fetch_failed') {
    return overview.counts.fetchFailed || 0;
  }
  return overview.counts[status] || 0;
};

const formatLimitation = (
  value: string,
  language: ReportLanguage,
  text: (typeof TEXT)[ReportLanguage],
): string => {
  const [rawKey, ...statusParts] = value.split(':');
  if (!rawKey || statusParts.length === 0) {
    return value;
  }

  const key = rawKey.trim();
  const status = statusParts.join(':').trim();
  if (!key || !status) {
    return value;
  }

  const label = BLOCK_LABELS[language][key] || key;
  const statusLabel = (text.status as Record<string, string>)[status] || status;
  return language === 'zh' ? `${label}：${statusLabel}` : `${label}: ${statusLabel}`;
};

const getMissingReasonSummary = (
  reason: string,
  language: ReportLanguage,
): string => {
  const label = MISSING_REASON_LABELS[language][reason];
  return label || UNKNOWN_MISSING_REASON_LABELS[language];
};

const getMissingReasonChips = (
  block: AnalysisContextPackOverview['blocks'][number],
  overview: AnalysisContextPackOverview,
  language: ReportLanguage,
  text: (typeof TEXT)[ReportLanguage],
): string[] => {
  const chips = (block.missingReasons || []).flatMap((reason) => {
    const action = MISSING_REASON_ACTIONS[language][reason];
    return [
      `${text.diagnosticCodes}: ${reason}`,
      action ? `${text.action}: ${action}` : null,
    ];
  }).filter((chip): chip is string => Boolean(chip));

  if (
    block.key === 'news'
    && block.missingReasons?.includes('news_context_missing')
    && (overview.metadata?.newsResultCount || 0) > 0
  ) {
    chips.push(`${text.scope}: ${NEWS_SUPPLEMENTAL_SCOPE_LABELS[language]}`);
  }

  return Array.from(new Set(chips));
};

export const AnalysisContextSummary: React.FC<AnalysisContextSummaryProps> = ({
  overview,
  language = 'zh',
}) => {
  const reportLanguage = normalizeReportLanguage(language);
  const text = TEXT[reportLanguage];

  if (!overview || !overview.blocks?.length) {
    return null;
  }

  const visibleCounts = STATUS_ORDER
    .map((status) => ({ status, value: getCount(overview, status) }))
    .filter((item) => item.value > 0);
  const summaryCounts = STATUS_ORDER
    .map((status) => ({ status, value: getCount(overview, status) }))
    .filter((item) => item.status === 'available' || item.status === 'missing' || item.value > 0);
  const metadataItems = [
    typeof overview.metadata?.newsResultCount === 'number'
      ? `${text.newsResultCount}: ${overview.metadata.newsResultCount}`
      : null,
  ].filter((item): item is string => Boolean(item));
  const triggerSource = overview.metadata?.triggerSource?.trim();
  const quality = overview.dataQuality;
  const qualityLevel = quality?.level || undefined;
  const qualityStyle = qualityLevel ? QUALITY_STYLE[qualityLevel] : undefined;
  const qualityLabel = qualityLevel ? text.qualityLevel[qualityLevel] : undefined;
  const limitations = quality?.limitations?.map((item) => formatLimitation(item, reportLanguage, text)) || [];

  return (
    <Card variant="bordered" padding="none" className="home-panel-card">
      <details data-testid="analysis-context-summary" className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
              <Database className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="label-uppercase">{text.eyebrow}</span>
              <span className="mt-0.5 block truncate text-base font-semibold text-foreground">
                {text.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-text">
                {text.evidenceScope}
              </span>
            </span>
          </div>
          <span className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {typeof quality?.overallScore === 'number' ? (
              <Badge variant={qualityStyle?.variant || 'default'} className="gap-1.5 shadow-none">
                {qualityStyle ? <StatusDot tone={qualityStyle.tone} className="h-1.5 w-1.5" /> : null}
                {text.qualityScore} {quality.overallScore}/100{qualityLabel ? ` ${qualityLabel}` : ''}
              </Badge>
            ) : null}
            {summaryCounts.map(({ status, value }) => {
              const style = STATUS_STYLE[status];
              return (
                <Badge key={status} variant={style.variant} className="gap-1.5 shadow-none">
                  <StatusDot tone={style.tone} className="h-1.5 w-1.5" />
                  {text.status[status]} {value}
                </Badge>
              );
            })}
            {triggerSource ? (
              <span className="home-accent-chip px-2 py-0.5 text-xs text-muted-text">
                {text.triggerSource}: {triggerSource}
              </span>
            ) : null}
            <span className="home-accent-chip px-2 py-0.5 text-xs text-muted-text">
              {text.inputScope}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-text transition-transform group-open:rotate-180" aria-hidden="true" />
          </span>
        </summary>

        <div className="home-divider border-t px-4 pb-4 pt-3">
          <DashboardPanelHeader
            eyebrow={text.eyebrow}
            title={text.title}
            leading={(
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                <Database className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            actions={metadataItems.length > 0 || typeof quality?.overallScore === 'number' ? (
              <div className="hidden flex-wrap justify-end gap-2 text-xs text-muted-text md:flex">
                {typeof quality?.overallScore === 'number' ? (
                  <span className="home-accent-chip px-2 py-0.5">
                    {text.qualityScore}: {quality.overallScore}/100{qualityLabel ? ` ${qualityLabel}` : ''}
                  </span>
                ) : null}
                {metadataItems.map((item) => (
                  <span key={item} className="home-accent-chip px-2 py-0.5">
                    {item}
                  </span>
                ))}
                <span className="home-accent-chip px-2 py-0.5">
                  {text.inputScope}
                </span>
              </div>
            ) : undefined}
          />

          {visibleCounts.length > 0 ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="label-uppercase">{text.counts}</span>
              {visibleCounts.map(({ status, value }) => {
                const style = STATUS_STYLE[status];
                return (
                  <Badge key={status} variant={style.variant} className="gap-1.5 shadow-none">
                    <StatusDot tone={style.tone} className="h-1.5 w-1.5" />
                    {text.status[status]} {value}
                  </Badge>
                );
              })}
            </div>
          ) : null}

          {limitations.length ? (
            <div className="mb-3 home-subpanel p-3 text-xs leading-5 text-muted-text">
              <span className="font-medium text-foreground">{text.limitations}: </span>
              {limitations.join(', ')}
            </div>
          ) : null}

          {overview.warnings?.length ? (
            <div className="mb-3 home-subpanel p-3 text-xs leading-5 text-warning">
              <span className="font-medium">{text.warnings}: </span>
              {overview.warnings.join(', ')}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {overview.blocks.map((block) => {
              const style = STATUS_STYLE[block.status] || STATUS_STYLE.missing;
              const hasMissingReasons = Boolean(block.missingReasons?.length);
              const guidanceSummary = hasMissingReasons
                ? block.missingReasons
                  ?.map((reason) => getMissingReasonSummary(reason, reportLanguage))
                  .join(', ')
                : STATUS_FALLBACK_GUIDANCE[reportLanguage][block.status];
              const guidanceChips = hasMissingReasons
                ? getMissingReasonChips(block, overview, reportLanguage, text)
                : STATUS_FALLBACK_ACTIONS[reportLanguage][block.status]
                  ? [`${text.action}: ${STATUS_FALLBACK_ACTIONS[reportLanguage][block.status]}`]
                  : [];
              return (
                <div key={block.key} className="home-subpanel p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{block.label}</p>
                      {block.source ? (
                        <p className="mt-1 truncate text-xs text-secondary-text">
                          {text.source}: {block.source}
                        </p>
                      ) : block.status !== 'available' ? (
                        <p className="mt-1 truncate text-xs text-secondary-text">
                          {text.source}: {text.sourceUnavailable}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant={style.variant} className="shrink-0 gap-1.5 shadow-none">
                      <StatusDot tone={style.tone} className="h-1.5 w-1.5" />
                      {text.status[block.status] || block.status}
                    </Badge>
                  </div>

                  {block.warnings?.length ? (
                    <p className="mt-2 text-xs leading-5 text-warning">
                      {text.warnings}: {block.warnings.join(', ')}
                    </p>
                  ) : null}
                  {guidanceSummary ? (
                    <p className="mt-2 text-xs leading-5 text-muted-text">
                      {hasMissingReasons ? text.missingReasons : text.statusGuidance}: {guidanceSummary}
                    </p>
                  ) : null}
                  {guidanceChips.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] leading-5">
                      {guidanceChips.map((chip) => (
                        <span key={chip} className="home-accent-chip max-w-full px-2 py-0.5 text-muted-text">
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {metadataItems.length > 0 || typeof quality?.overallScore === 'number' ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-text md:hidden">
              {typeof quality?.overallScore === 'number' ? (
                <span className="home-accent-chip px-2 py-0.5">
                  {text.qualityScore}: {quality.overallScore}/100{qualityLabel ? ` ${qualityLabel}` : ''}
                </span>
              ) : null}
              {metadataItems.map((item) => (
                <span key={item} className="home-accent-chip px-2 py-0.5">
                  {item}
                </span>
              ))}
              <span className="home-accent-chip px-2 py-0.5">
                {text.inputScope}
              </span>
            </div>
          ) : null}
        </div>
      </details>
    </Card>
  );
};

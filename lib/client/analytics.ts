'use client';

export type AnalyticsContext = {
  visitorId: string;
  sessionId: string;
  landingUrl: string;
  referrer: string;
  sourceType: 'paid' | 'organic' | 'direct' | 'referral';
  sourcePlatform: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
};

const VISITOR_KEY = 'vovo-visitor';
const SESSION_KEY = 'vovo-session';
const ATTRIBUTION_KEY = 'vovo-attribution';

const safeHostname = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

export function classifyAttribution(url: URL, referrer: string) {
  const source = (url.searchParams.get('utm_source') || '').toLowerCase();
  const medium = (url.searchParams.get('utm_medium') || '').toLowerCase();
  const referrerHost = safeHostname(referrer);
  const hasPaidClick = ['gclid', 'fbclid', 'ttclid', 'msclkid'].some((key) =>
    url.searchParams.has(key),
  );
  const paidMedium = /(cpc|ppc|paid|paid_social|display|ads?)/.test(medium);
  const platformSource = source || referrerHost;
  const platform =
    /instagram/.test(platformSource) ? 'Instagram' :
      /facebook|fb\./.test(platformSource) || url.searchParams.has('fbclid') ? 'Facebook' :
        /tiktok/.test(platformSource) || url.searchParams.has('ttclid') ? 'TikTok' :
          /youtube|youtu\.be/.test(platformSource) ? 'YouTube' :
            /google|gclid/.test(`${platformSource} ${hasPaidClick && url.searchParams.has('gclid') ? 'gclid' : ''}`) ? 'Google' :
              /bing|msclkid/.test(`${platformSource} ${hasPaidClick && url.searchParams.has('msclkid') ? 'msclkid' : ''}`) ? 'Bing' :
                source ? source : referrerHost ? referrerHost : 'Direto';
  const isSearch = /(google|bing|yahoo|duckduckgo|ecosia)/.test(referrerHost);
  const isSocial = /(instagram|facebook|tiktok|youtube|pinterest|x\.com|twitter)/.test(referrerHost);
  const sourceType = hasPaidClick || paidMedium
    ? 'paid'
    : !referrerHost
      ? 'direct'
      : isSearch || isSocial
        ? 'organic'
        : 'referral';
  return { sourceType, sourcePlatform: platform } as const;
}

function identifier(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const next = crypto.randomUUID();
  storage.setItem(key, next);
  return next;
}

export function getAnalyticsContext(): AnalyticsContext {
  const cached = sessionStorage.getItem(ATTRIBUTION_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as AnalyticsContext;
    } catch {
      sessionStorage.removeItem(ATTRIBUTION_KEY);
    }
  }
  const url = new URL(window.location.href);
  const classified = classifyAttribution(url, document.referrer);
  const context: AnalyticsContext = {
    visitorId: identifier(localStorage, VISITOR_KEY),
    sessionId: identifier(sessionStorage, SESSION_KEY),
    landingUrl: `${url.origin}${url.pathname}`,
    referrer: safeHostname(document.referrer),
    ...classified,
    utmSource: url.searchParams.get('utm_source') || '',
    utmMedium: url.searchParams.get('utm_medium') || '',
    utmCampaign: url.searchParams.get('utm_campaign') || '',
    utmContent: url.searchParams.get('utm_content') || '',
    utmTerm: url.searchParams.get('utm_term') || '',
  };
  sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(context));
  return context;
}

function deviceInfo() {
  const ua = navigator.userAgent;
  return {
    device: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop',
    browser: /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) && !/Chrome\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Outro',
    os: /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Outro',
  };
}

export function sendAnalytics(name: string, payload: Record<string, unknown> = {}) {
  if (new URLSearchParams(window.location.search).get('editorPreview') === '1') return;
  const context = getAnalyticsContext();
  const body = JSON.stringify({
    name,
    sessionId: context.sessionId,
    visitorId: context.visitorId,
    visibility: document.visibilityState,
    payload: {
      ...payload,
      ...context,
      ...deviceInfo(),
      path: window.location.pathname,
      pageTitle: document.title,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      occurredAt: new Date().toISOString(),
    },
  });
  const blob = new Blob([body], { type: 'application/json' });
  if (navigator.sendBeacon?.('/api/analytics', blob)) return;
  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

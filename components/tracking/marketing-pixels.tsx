'use client';

import { useEffect } from 'react';

type PixelQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
};

type TikTokQueue = unknown[] & {
  load?: (id: string) => void;
  page?: () => void;
  track?: (
    name: string,
    data?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => void;
  methods?: string[];
  setAndDefer?: (target: TikTokQueue, method: string) => void;
  instance?: (id: string) => TikTokQueue;
  _i?: Record<string, unknown[]>;
  _t?: Record<string, number>;
  _o?: Record<string, Record<string, unknown>>;
};

type PixelWindow = Window & {
  fbq?: PixelQueue;
  _fbq?: PixelQueue;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  ttq?: TikTokQueue;
  __vovoPixelIds?: Set<string>;
};

export type MarketingEventName =
  | 'page_view'
  | 'bundle_add_to_cart'
  | 'order_bump_accept'
  | 'cart_offer_accept'
  | 'checkout_started';

const marketingNames: Record<
  MarketingEventName,
  { meta: string; google: string; tiktok: string }
> = {
  page_view: { meta: 'PageView', google: 'page_view', tiktok: 'PageView' },
  bundle_add_to_cart: {
    meta: 'AddToCart',
    google: 'add_to_cart',
    tiktok: 'AddToCart',
  },
  order_bump_accept: {
    meta: 'AddToCart',
    google: 'add_to_cart',
    tiktok: 'AddToCart',
  },
  cart_offer_accept: {
    meta: 'AddToCart',
    google: 'add_to_cart',
    tiktok: 'AddToCart',
  },
  checkout_started: {
    meta: 'InitiateCheckout',
    google: 'begin_checkout',
    tiktok: 'InitiateCheckout',
  },
};

function addScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initializeMeta(win: PixelWindow, id: string) {
  if (!id || win.__vovoPixelIds?.has(`meta:${id}`)) return;
  if (!win.fbq) {
    const queue = ((...args: unknown[]) => {
      if (queue.callMethod) queue.callMethod(...args);
      else (queue.queue ||= []).push(args);
    }) as PixelQueue;
    queue.queue = [];
    queue.loaded = true;
    queue.version = '2.0';
    win.fbq = queue;
    win._fbq = queue;
  }
  win.fbq('init', id);
  win.__vovoPixelIds?.add(`meta:${id}`);
  addScript(
    'vovo-meta-pixel',
    'https://connect.facebook.net/en_US/fbevents.js',
  );
}

function initializeGoogle(win: PixelWindow, id: string) {
  if (!id || win.__vovoPixelIds?.has(`google:${id}`)) return;
  win.dataLayer ||= [];
  win.gtag ||= (...args: unknown[]) => win.dataLayer?.push(args);
  win.gtag('js', new Date());
  win.gtag('config', id, { send_page_view: false });
  win.__vovoPixelIds?.add(`google:${id}`);
  addScript(
    'vovo-google-tag',
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
  );
}

function initializeTikTok(win: PixelWindow, id: string) {
  if (!id || win.__vovoPixelIds?.has(`tiktok:${id}`)) return;
  if (!win.ttq) {
    const queue = [] as TikTokQueue;
    queue.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie',
    ];
    queue.setAndDefer = (target, method) => {
      const deferred = target as unknown as Record<string, unknown>;
      deferred[method] = (...args: unknown[]) => {
        target.push([method, ...args]);
      };
    };
    queue.methods.forEach((method) => queue.setAndDefer?.(queue, method));
    queue.instance = (pixelId) => {
      const instance = (queue._i?.[pixelId] || []) as TikTokQueue;
      queue.methods?.forEach((method) => queue.setAndDefer?.(instance, method));
      return instance;
    };
    queue.load = (pixelId) => {
      queue._i ||= {};
      queue._t ||= {};
      queue._o ||= {};
      queue._i[pixelId] = [];
      queue._t[pixelId] = Date.now();
      queue._o[pixelId] = {};
      addScript(
        'vovo-tiktok-pixel',
        `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`,
      );
    };
    win.ttq = queue;
  }
  win.ttq.load?.(id);
  win.__vovoPixelIds?.add(`tiktok:${id}`);
}

export function trackMarketingEvent(
  name: MarketingEventName,
  data: Record<string, unknown> = {},
) {
  if (typeof window === 'undefined') return;
  const win = window as PixelWindow;
  const names = marketingNames[name];
  if (!names) return;
  const cents = typeof data.total === 'number' ? data.total : data.price;
  const normalized = {
    ...data,
    ...(typeof cents === 'number'
      ? { value: cents / 100, currency: 'BRL' }
      : {}),
  };
  win.fbq?.('track', names.meta, normalized);
  win.gtag?.('event', names.google, normalized);
  win.ttq?.track?.(names.tiktok, normalized);
}

type Purchase = {
  eventId: string;
  value: number;
  currency: string;
  itemCount: number;
  contentIds: string[];
};

export function MarketingPixels({
  metaPixelId,
  googleAnalyticsId,
  tiktokPixelId,
  purchase,
}: {
  metaPixelId: string;
  googleAnalyticsId: string;
  tiktokPixelId: string;
  purchase?: Purchase;
}) {
  useEffect(() => {
    const win = window as PixelWindow;
    win.__vovoPixelIds ||= new Set<string>();
    initializeMeta(win, metaPixelId.trim());
    initializeGoogle(win, googleAnalyticsId.trim());
    initializeTikTok(win, tiktokPixelId.trim());

    if (!purchase) return;
    const data = {
      value: purchase.value / 100,
      currency: purchase.currency.toUpperCase(),
      content_ids: purchase.contentIds,
      content_type: 'product',
      num_items: purchase.itemCount,
      transaction_id: purchase.eventId,
    };
    const sendOnce = (platform: string, enabled: boolean, send: () => void) => {
      if (!enabled) return;
      const storageKey = `vovo-paid-purchase:${platform}:${purchase.eventId}`;
      if (localStorage.getItem(storageKey)) return;
      send();
      localStorage.setItem(storageKey, new Date().toISOString());
    };
    sendOnce('meta', Boolean(metaPixelId.trim()), () =>
      win.fbq?.('track', 'Purchase', data, { eventID: purchase.eventId }),
    );
    sendOnce('google', Boolean(googleAnalyticsId.trim()), () =>
      win.gtag?.('event', 'purchase', {
        ...data,
        items: purchase.contentIds.map((item_id) => ({ item_id, quantity: 1 })),
      }),
    );
    sendOnce('tiktok', Boolean(tiktokPixelId.trim()), () =>
      win.ttq?.track?.('CompletePayment', data, { event_id: purchase.eventId }),
    );
  }, [googleAnalyticsId, metaPixelId, purchase, tiktokPixelId]);

  return null;
}

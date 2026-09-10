import {
  defaultSiteConfig,
  type PublicSiteConfig,
} from '@/lib/catalog';
import { selectRows } from '@/lib/server/supabase';

const runtimeDefaults: PublicSiteConfig = {
  ...defaultSiteConfig,
  keyword: 'babosa',
  metaPixelId: '',
  googleAnalyticsId: '',
  tiktokPixelId: '',
};

const optimizedAssetAliases: Record<string, string> = {
  '/images/hero-vovo-tereza.png': '/images/hero-vovo-tereza.jpg',
  '/images/vovo-tereza-cozinha.png': '/images/vovo-tereza-cozinha-v2.jpg',
  '/images/vovo-tereza-cozinha-v2.png': '/images/vovo-tereza-cozinha-v2.jpg',
  '/images/vovo-tereza-caderno.png': '/images/vovo-tereza-caderno-v2.jpg',
  '/images/vovo-tereza-caderno-v2.png': '/images/vovo-tereza-caderno-v2.jpg',
};

function normalizeAsset(value: string) {
  return optimizedAssetAliases[value] || value;
}

export async function getSiteConfig(): Promise<PublicSiteConfig> {
  try {
    const [row] = await selectRows<{ value: Partial<PublicSiteConfig> }>(
      'site_settings',
      { key: 'eq.public_config', select: 'value', limit: 1 },
    );
    const config = {
      ...runtimeDefaults,
      ...row?.value,
    };
    return {
      ...config,
      heroImage: normalizeAsset(config.heroImage),
      founderImage: normalizeAsset(config.founderImage),
    };
  } catch {
    return structuredClone(runtimeDefaults);
  }
}

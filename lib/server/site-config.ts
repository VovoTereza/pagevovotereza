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

export async function getSiteConfig(): Promise<PublicSiteConfig> {
  try {
    const [row] = await selectRows<{ value: Partial<PublicSiteConfig> }>(
      'site_settings',
      { key: 'eq.public_config', select: 'value', limit: 1 },
    );
    return {
      ...runtimeDefaults,
      ...row?.value,
    };
  } catch {
    return structuredClone(runtimeDefaults);
  }
}

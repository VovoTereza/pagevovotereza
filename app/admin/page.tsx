import { env } from 'cloudflare:workers';
import { redirect } from 'next/navigation';
import { sql } from 'drizzle-orm';
import { AdminDashboard } from '@/components/admin/dashboard';
import { getAdminEmail } from '@/lib/server/admin-auth';
import { defaultSiteConfig } from '@/lib/catalog';
import { getDb } from '@/db';
import { orders, siteSettings } from '@/db/schema';

export default async function AdminPage() {
  if (!await getAdminEmail()) redirect('/admin/login');
  let config = { ...defaultSiteConfig, keyword:'babosa', metaPixelId:'', googleAnalyticsId:'', tiktokPixelId:'' }; let orderCount=0; let revenue=0;
  try { const [row] = await getDb().select().from(siteSettings).limit(1); if (row?.value) config = row.value as typeof config; const [metrics] = await getDb().select({ count:sql<number>`count(*)`, revenue:sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end),0)` }).from(orders); orderCount=Number(metrics?.count||0); revenue=Number(metrics?.revenue||0); } catch {}
  void env; return <AdminDashboard initialConfig={config} orderCount={orderCount} revenue={revenue}/>;
}

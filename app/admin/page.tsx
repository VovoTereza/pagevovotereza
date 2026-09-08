import { env } from 'cloudflare:workers';
import { redirect } from 'next/navigation';
import { desc, sql } from 'drizzle-orm';
import { AdminDashboard } from '@/components/admin/dashboard';
import { getAdminEmail } from '@/lib/server/admin-auth';
import { defaultSiteConfig } from '@/lib/catalog';
import { getDb } from '@/db';
import { orders, siteSettings } from '@/db/schema';
import { getCatalogConfig } from '@/lib/server/catalog-config';

export default async function AdminPage() {
  if (!(await getAdminEmail())) redirect('/admin/login');
  let config = {
    ...defaultSiteConfig,
    keyword: 'babosa',
    metaPixelId: '',
    googleAnalyticsId: '',
    tiktokPixelId: '',
  };
  let orderCount = 0;
  let revenue = 0;
  let recentOrders: (typeof orders.$inferSelect)[] = [];
  try {
    const [row] = await getDb()
      .select()
      .from(siteSettings)
      .where(sql`${siteSettings.key} = 'public_config'`)
      .limit(1);
    if (row?.value)
      config = { ...config, ...(row.value as Partial<typeof config>) };
    const [metrics] = await getDb()
      .select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end),0)`,
      })
      .from(orders);
    orderCount = Number(metrics?.count || 0);
    revenue = Number(metrics?.revenue || 0);
    recentOrders = await getDb()
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(50);
  } catch {}
  const catalog = await getCatalogConfig();
  void env;
  return (
    <AdminDashboard
      initialConfig={config}
      initialCatalog={catalog}
      orderCount={orderCount}
      revenue={revenue}
      recentOrders={recentOrders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }))}
    />
  );
}

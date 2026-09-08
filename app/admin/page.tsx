import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/dashboard';
import { getAdminEmail } from '@/lib/server/admin-auth';
import { defaultSiteConfig } from '@/lib/catalog';
import { getCatalogConfig } from '@/lib/server/catalog-config';
import { selectRows } from '@/lib/server/supabase';

type AdminOrderRow = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
};

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
  let recentOrders: AdminOrderRow[] = [];
  try {
    const [row] = await selectRows<{ value: Partial<typeof config> }>('site_settings', {
      key: 'eq.public_config', select: 'value', limit: 1,
    });
    if (row?.value)
      config = { ...config, ...(row.value as Partial<typeof config>) };
    recentOrders = await selectRows<AdminOrderRow>('orders', {
      select: 'id,order_number,customer_name,customer_email,status,payment_status,total,currency,created_at',
      order: 'created_at.desc', limit: 50,
    });
    orderCount = recentOrders.length;
    revenue = recentOrders.reduce((sum, order) => sum + (order.payment_status === 'paid' ? order.total : 0), 0);
  } catch {}
  const catalog = await getCatalogConfig();
  return (
    <AdminDashboard
      initialConfig={config}
      initialCatalog={catalog}
      orderCount={orderCount}
      revenue={revenue}
      recentOrders={recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        status: order.status,
        paymentStatus: order.payment_status,
        total: order.total,
        currency: order.currency,
        createdAt: order.created_at,
      }))}
    />
  );
}

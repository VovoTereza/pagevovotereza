declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    ADMIN_SESSION_SECRET?: string;
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    SUPABASE_STORAGE_BUCKET?: string;
    NEXT_PUBLIC_SITE_URL?: string;
  }
}

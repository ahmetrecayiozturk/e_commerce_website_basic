import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261004000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "store_setting" (
        "id" varchar(255) not null,
        "tenant_id" varchar(255) not null default 'default',
        "store_name" varchar(255) not null default 'Yeni Mağaza',
        "store_slug" varchar(255) null,
        "logo_url" text null,
        "primary_color" varchar(32) null,
        "secondary_color" varchar(32) null,
        "contact_email" varchar(255) null,
        "contact_phone" varchar(255) null,
        "address" text null,
        "social_links" jsonb null default '{}'::jsonb,
        "return_policy" text null,
        "shipping_policy" text null,
        "theme_key" text check ("theme_key" in ('classic', 'minimal', 'modern', 'fashion')) not null default 'classic',
        "country_code" varchar(10) null,
        "default_region_id" varchar(255) null,
        "default_currency_code" varchar(10) null,
        "default_sales_channel_id" varchar(255) null,
        "default_shipping_profile_id" varchar(255) null,
        "default_shipping_option_id" varchar(255) null,
        "default_stock_location_id" varchar(255) null,
        "default_payment_provider_id" varchar(255) null,
        "shipping_fee" numeric(12,2) not null default 0,
        "free_shipping_limit" numeric(12,2) not null default 0,
        "estimated_delivery_days" int not null default 3,
        "is_active" boolean not null default true,
        "audit_log" jsonb null default '[]'::jsonb,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "store_setting_pkey" primary key ("id"),
        constraint "store_setting_tenant_id_unique" unique ("tenant_id")
      );
    `)

    this.addSql(`
      create index if not exists "IDX_store_setting_tenant_id"
      on "store_setting" ("tenant_id");
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_setting" cascade;`)
  }
}

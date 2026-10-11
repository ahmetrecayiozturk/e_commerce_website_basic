import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261011000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      alter table "store_setting"
        add column if not exists "iyzico_api_key" text null,
        add column if not exists "iyzico_secret_key" text null,
        add column if not exists "iyzico_base_url" text null,
        add column if not exists "smtp_host" text null,
        add column if not exists "smtp_port" int null,
        add column if not exists "smtp_user" text null,
        add column if not exists "smtp_pass" text null,
        add column if not exists "smtp_from" text null,
        add column if not exists "smtp_secure" boolean null;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`
      alter table "store_setting"
        drop column if exists "iyzico_api_key",
        drop column if exists "iyzico_secret_key",
        drop column if exists "iyzico_base_url",
        drop column if exists "smtp_host",
        drop column if exists "smtp_port",
        drop column if exists "smtp_user",
        drop column if exists "smtp_pass",
        drop column if exists "smtp_from",
        drop column if exists "smtp_secure";
    `)
  }
}

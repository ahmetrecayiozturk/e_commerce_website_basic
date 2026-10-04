import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260920014327 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "return_request" add column if not exists "return_carrier" text check ("return_carrier" in ('yurtici', 'aras', 'mng', 'ptt', 'surat', 'ups', 'other')) null, add column if not exists "return_code" text null, add column if not exists "return_instructions" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "return_request" drop column if exists "return_carrier", drop column if exists "return_code", drop column if exists "return_instructions";`);
  }

}

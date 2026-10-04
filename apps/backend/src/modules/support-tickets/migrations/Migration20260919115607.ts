import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260919115607 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "support_ticket" ("id" text not null, "order_id" text null, "order_display_id" integer null, "customer_email" text not null, "customer_name" text not null, "subject" text not null, "status" text check ("status" in ('open', 'closed')) not null default 'open', "messages" jsonb not null default '[]', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_ticket_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_ticket_customer_email" ON "support_ticket" ("customer_email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_ticket_deleted_at" ON "support_ticket" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "support_ticket" cascade;`);
  }

}

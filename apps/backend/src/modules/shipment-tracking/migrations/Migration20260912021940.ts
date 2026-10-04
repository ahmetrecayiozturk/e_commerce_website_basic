import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912021940 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "shipment_tracking" ("id" text not null, "order_id" text not null, "fulfillment_id" text null, "carrier" text check ("carrier" in ('yurtici', 'aras', 'mng', 'ptt', 'surat', 'ups', 'other')) not null, "carrier_name" text null, "tracking_number" text not null, "tracking_url" text null, "status" text check ("status" in ('preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed')) not null default 'preparing', "status_history" jsonb not null default '[]', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipment_tracking_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipment_tracking_order_id" ON "shipment_tracking" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipment_tracking_deleted_at" ON "shipment_tracking" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "shipment_tracking" cascade;`);
  }

}

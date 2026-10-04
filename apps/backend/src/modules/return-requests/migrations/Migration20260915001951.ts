import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260915001951 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "return_request" add column if not exists "type" text check ("type" in ('return', 'cancellation')) not null default 'return';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "return_request" drop column if exists "type";`);
  }

}

import { pgTable, serial, integer, numeric, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  items: jsonb("items").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof ordersTable.$inferSelect;

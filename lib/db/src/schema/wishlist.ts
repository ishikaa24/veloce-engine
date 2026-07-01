import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlistTable.$inferSelect;

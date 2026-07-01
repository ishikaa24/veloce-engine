import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, usersTable, reviewsTable } from "@workspace/db";
import { eq, sql, desc, lte, gte, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/analytics/dashboard", requireAdmin, async (_req, res) => {
  const [revRow] = await db.select({ total: sql<string>`COALESCE(SUM(CAST(total AS NUMERIC)), 0)` }).from(ordersTable).where(sql`status != 'cancelled'`);
  const [ordRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(ordersTable);
  const [prodRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(productsTable);
  const [custRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(eq(usersTable.role, "customer"));
  const [lowRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(productsTable).where(lte(productsTable.stock, 5));
  const [pendRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending"));

  res.json({
    totalRevenue: parseFloat(revRow.total ?? "0"),
    totalOrders: Number(ordRow.count),
    totalProducts: Number(prodRow.count),
    totalCustomers: Number(custRow.count),
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    lowStockCount: Number(lowRow.count),
    pendingOrders: Number(pendRow.count),
  });
});

router.get("/analytics/revenue", requireAdmin, async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(created_at, 'Mon') AS month,
      EXTRACT(MONTH FROM created_at) AS month_num,
      EXTRACT(YEAR FROM created_at) AS year,
      COALESCE(SUM(CAST(total AS NUMERIC)), 0) AS revenue,
      COUNT(*) AS orders
    FROM orders
    WHERE status != 'cancelled'
      AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY month, month_num, year
    ORDER BY year, month_num
  `);
  res.json((rows as any[]).map(r => ({
    month: r.month,
    revenue: parseFloat(r.revenue),
    orders: Number(r.orders),
  })));
});

router.get("/analytics/top-products", requireAdmin, async (_req, res) => {
  // Aggregate from orders JSONB items
  const rows = await db.execute(sql`
    SELECT
      (item->>'productId')::int AS product_id,
      (item->>'name') AS name,
      (item->>'imageUrl') AS image_url,
      SUM((item->>'quantity')::int) AS total_sold,
      SUM((item->>'subtotal')::numeric) AS revenue
    FROM orders, jsonb_array_elements(items) AS item
    WHERE status != 'cancelled'
    GROUP BY product_id, name, image_url
    ORDER BY total_sold DESC
    LIMIT 5
  `);
  res.json((rows as any[]).map(r => ({
    productId: r.product_id,
    name: r.name,
    imageUrl: r.image_url,
    totalSold: Number(r.total_sold),
    revenue: parseFloat(r.revenue),
  })));
});

router.get("/analytics/category-distribution", requireAdmin, async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT
      c.name AS category_name,
      COUNT(p.id) AS count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.name
    ORDER BY count DESC
  `);
  const total = (rows as any[]).reduce((s, r) => s + Number(r.count), 0);
  res.json((rows as any[]).map(r => ({
    categoryName: r.category_name,
    count: Number(r.count),
    percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
  })));
});

router.get("/analytics/recent-activity", requireAdmin, async (_req, res) => {
  const orders = await db
    .select({ o: ordersTable, u: usersTable })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  const reviews = await db
    .select({ r: reviewsTable, u: usersTable, p: productsTable })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .leftJoin(productsTable, eq(reviewsTable.productId, productsTable.id))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(3);

  const activity = [
    ...orders.map(({ o, u }) => ({
      id: o.id,
      type: o.status === "shipped" ? "order_shipped" : o.status === "delivered" ? "order_delivered" : "order_placed",
      description: `Order #${o.id} ${o.status} by ${u?.name ?? "Unknown"}`,
      createdAt: o.createdAt.toISOString(),
      metadata: { orderId: o.id, total: parseFloat(o.total) },
    })),
    ...reviews.map(({ r, u, p }) => ({
      id: r.id + 10000,
      type: "review_posted",
      description: `${u?.name ?? "Someone"} reviewed ${p?.name ?? "a product"} (${r.rating}/5)`,
      createdAt: r.createdAt.toISOString(),
      metadata: { productId: r.productId, rating: r.rating },
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  res.json(activity);
});

router.get("/analytics/inventory-alerts", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(lte(productsTable.stock, 10))
    .orderBy(productsTable.stock)
    .limit(10);
  res.json(rows.map(p => ({
    productId: p.id,
    name: p.name,
    stock: p.stock,
    imageUrl: p.imageUrl,
    threshold: 10,
  })));
});

export default router;

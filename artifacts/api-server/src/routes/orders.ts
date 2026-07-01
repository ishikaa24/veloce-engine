import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { ListOrdersQueryParams, CreateOrderBody, GetOrderParams, UpdateOrderStatusBody, UpdateOrderStatusParams, CancelOrderParams } from "@workspace/api-zod";

const router = Router();

function formatOrder(o: any, customerName?: string | null) {
  return {
    id: o.id,
    userId: o.userId,
    customerName: customerName ?? null,
    status: o.status,
    items: o.items,
    total: parseFloat(o.total),
    shippingAddress: o.shippingAddress,
    createdAt: o.createdAt?.toISOString?.() ?? o.createdAt,
  };
}

router.get("/orders", requireAuth, async (req: AuthRequest, res) => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  const page = parsed.success ? (parsed.data.page ?? 1) : 1;
  const status = parsed.success ? parsed.data.status : undefined;

  const isAdmin = req.userRole === "admin";
  const conditions = [];
  if (!isAdmin) conditions.push(eq(ordersTable.userId, req.userId!));
  if (status) conditions.push(eq(ordersTable.status, status as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = 10;

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where);
  const total = Number(count);

  const rows = await db
    .select({ o: ordersTable, u: usersTable })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .where(where)
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  res.json({
    orders: rows.map(r => formatOrder(r.o, r.u?.name)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/orders", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const cartItems = await db
    .select({ ci: cartItemsTable, p: productsTable })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, req.userId!));

  if (!cartItems.length) { res.status(400).json({ error: "Cart is empty" }); return; }

  const items = cartItems.map(({ ci, p }) => ({
    productId: p.id,
    name: p.name,
    price: parseFloat(p.price),
    imageUrl: p.imageUrl,
    quantity: ci.quantity,
    subtotal: parseFloat(p.price) * ci.quantity,
  }));

  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const [order] = await db.insert(ordersTable).values({
    userId: req.userId!,
    items,
    total: String(total),
    shippingAddress: parsed.data.shippingAddress,
  }).returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = GetOrderParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const rows = await db
    .select({ o: ordersTable, u: usersTable })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .where(eq(ordersTable.id, parsed.data.id))
    .limit(1);
  if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
  const row = rows[0];
  if (req.userRole !== "admin" && row.o.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  res.json(formatOrder(row.o, row.u?.name));
});

router.patch("/orders/:id/status", requireAdmin, async (req, res) => {
  const params = UpdateOrderStatusParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatOrder(order));
});

router.patch("/orders/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CancelOrderParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, parsed.data.id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (req.userRole !== "admin" && existing.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  const [order] = await db.update(ordersTable).set({ status: "cancelled" }).where(eq(ordersTable.id, parsed.data.id)).returning();
  res.json(formatOrder(order));
});

export default router;

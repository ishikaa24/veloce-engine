import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveFromCartParams } from "@workspace/api-zod";

const router = Router();

async function getCartForUser(userId: number) {
  const items = await db
    .select({ ci: cartItemsTable, p: productsTable })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map(({ ci, p }) => ({
    productId: p.id,
    name: p.name,
    price: parseFloat(p.price),
    imageUrl: p.imageUrl,
    quantity: ci.quantity,
    subtotal: parseFloat(p.price) * ci.quantity,
  }));

  const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  return {
    items: cartItems,
    subtotal,
    total: subtotal,
    itemCount: cartItems.reduce((s, i) => s + i.quantity, 0),
  };
}

router.get("/cart", requireAuth, async (req: AuthRequest, res) => {
  res.json(await getCartForUser(req.userId!));
});

router.post("/cart/items", requireAuth, async (req: AuthRequest, res) => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { productId, quantity } = parsed.data;
  const existing = await db.select().from(cartItemsTable).where(and(eq(cartItemsTable.userId, req.userId!), eq(cartItemsTable.productId, productId))).limit(1);
  if (existing.length > 0) {
    await db.update(cartItemsTable).set({ quantity: existing[0].quantity + quantity }).where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ userId: req.userId!, productId, quantity });
  }
  res.json(await getCartForUser(req.userId!));
});

router.patch("/cart/items/:productId", requireAuth, async (req: AuthRequest, res) => {
  const params = UpdateCartItemParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  if (parsed.data.quantity <= 0) {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, req.userId!), eq(cartItemsTable.productId, params.data.productId)));
  } else {
    await db.update(cartItemsTable).set({ quantity: parsed.data.quantity }).where(and(eq(cartItemsTable.userId, req.userId!), eq(cartItemsTable.productId, params.data.productId)));
  }
  res.json(await getCartForUser(req.userId!));
});

router.delete("/cart/items/:productId", requireAuth, async (req: AuthRequest, res) => {
  const params = RemoveFromCartParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, req.userId!), eq(cartItemsTable.productId, params.data.productId)));
  res.json(await getCartForUser(req.userId!));
});

router.delete("/cart/clear", requireAuth, async (req: AuthRequest, res) => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
  res.json(await getCartForUser(req.userId!));
});

export default router;

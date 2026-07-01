import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { AddToWishlistParams, RemoveFromWishlistParams } from "@workspace/api-zod";

const router = Router();

function formatProduct(p: any, categoryName?: string | null) {
  return {
    id: p.id, name: p.name, description: p.description,
    price: parseFloat(p.price), comparePrice: p.comparePrice ? parseFloat(p.comparePrice) : null,
    stock: p.stock, categoryId: p.categoryId, categoryName: categoryName ?? null,
    imageUrl: p.imageUrl, images: p.images ?? [], rating: parseFloat(p.rating ?? "0"),
    reviewCount: p.reviewCount ?? 0, isFeatured: p.isFeatured ?? false,
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
  };
}

router.get("/wishlist", requireAuth, async (req: AuthRequest, res) => {
  const rows = await db
    .select({ w: wishlistTable, p: productsTable, catName: categoriesTable.name })
    .from(wishlistTable)
    .innerJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(wishlistTable.userId, req.userId!))
    .orderBy(wishlistTable.addedAt);
  res.json(rows.map(({ w, p, catName }) => ({
    id: w.id, userId: w.userId, productId: w.productId,
    product: formatProduct(p, catName),
    addedAt: w.addedAt.toISOString(),
  })));
});

router.post("/wishlist/:productId", requireAuth, async (req: AuthRequest, res) => {
  const parsed = AddToWishlistParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const existing = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, req.userId!), eq(wishlistTable.productId, parsed.data.productId))).limit(1);
  if (existing.length) { res.status(400).json({ error: "Already in wishlist" }); return; }
  const [item] = await db.insert(wishlistTable).values({ userId: req.userId!, productId: parsed.data.productId }).returning();
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, parsed.data.productId)).limit(1);
  res.status(201).json({
    id: item.id, userId: item.userId, productId: item.productId,
    product: rows[0] ? formatProduct(rows[0].p, rows[0].catName) : null,
    addedAt: item.addedAt.toISOString(),
  });
});

router.delete("/wishlist/:productId", requireAuth, async (req: AuthRequest, res) => {
  const parsed = RemoveFromWishlistParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, req.userId!), eq(wishlistTable.productId, parsed.data.productId)));
  res.status(204).send();
});

export default router;

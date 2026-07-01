import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, productsTable, usersTable } from "@workspace/db";
import { eq, avg, count } from "drizzle-orm";
import { requireAuth, optionalAuth, type AuthRequest } from "../middlewares/auth";
import { ListReviewsParams, CreateReviewParams, CreateReviewBody } from "@workspace/api-zod";

const router = Router();

router.get("/products/:productId/reviews", optionalAuth, async (req, res) => {
  const parsed = ListReviewsParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const rows = await db
    .select({ r: reviewsTable, u: usersTable })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.productId, parsed.data.productId))
    .orderBy(reviewsTable.createdAt);
  res.json(rows.map(({ r, u }) => ({
    id: r.id,
    userId: r.userId,
    userName: u?.name ?? null,
    productId: r.productId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/products/:productId/reviews", requireAuth, async (req: AuthRequest, res) => {
  const params = CreateReviewParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [review] = await db.insert(reviewsTable).values({
    userId: req.userId!,
    productId: params.data.productId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  }).returning();

  // Update product rating
  const [stats] = await db
    .select({ avgRating: avg(reviewsTable.rating), cnt: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, params.data.productId));
  await db.update(productsTable).set({
    rating: String(parseFloat(stats.avgRating ?? "0").toFixed(2)),
    reviewCount: stats.cnt,
  }).where(eq(productsTable.id, params.data.productId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  res.status(201).json({
    id: review.id,
    userId: review.userId,
    userName: user?.name ?? null,
    productId: review.productId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;

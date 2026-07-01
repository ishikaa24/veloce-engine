import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, like, and, gte, lte, sql, desc, asc } from "drizzle-orm";
import { requireAdmin, optionalAuth } from "../middlewares/auth";
import { ListProductsQueryParams, CreateProductBody, UpdateProductBody, GetProductParams, DeleteProductParams, UpdateProductParams } from "@workspace/api-zod";

const router = Router();

function formatProduct(p: any, categoryName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    comparePrice: p.comparePrice ? parseFloat(p.comparePrice) : null,
    stock: p.stock,
    categoryId: p.categoryId,
    categoryName: categoryName ?? null,
    imageUrl: p.imageUrl,
    images: p.images ?? [],
    rating: parseFloat(p.rating ?? "0"),
    reviewCount: p.reviewCount ?? 0,
    isFeatured: p.isFeatured ?? false,
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
  };
}

router.get("/products", optionalAuth, async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  const page = parsed.success ? (parsed.data.page ?? 1) : 1;
  const limit = parsed.success ? (parsed.data.limit ?? 12) : 12;
  const search = parsed.success ? parsed.data.search : undefined;
  const categoryId = parsed.success ? parsed.data.categoryId : undefined;
  const minPrice = parsed.success ? parsed.data.minPrice : undefined;
  const maxPrice = parsed.success ? parsed.data.maxPrice : undefined;
  const sort = parsed.success ? parsed.data.sort : "newest";

  const conditions = [];
  if (search) conditions.push(like(productsTable.name, `%${search}%`));
  if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
  if (minPrice != null) conditions.push(gte(sql`CAST(${productsTable.price} AS NUMERIC)`, minPrice));
  if (maxPrice != null) conditions.push(lte(sql`CAST(${productsTable.price} AS NUMERIC)`, maxPrice));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (sort) {
    case "price_asc": orderBy = asc(productsTable.price); break;
    case "price_desc": orderBy = desc(productsTable.price); break;
    case "rating": orderBy = desc(productsTable.rating); break;
    case "oldest": orderBy = asc(productsTable.createdAt); break;
    default: orderBy = desc(productsTable.createdAt);
  }

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where);
  const total = Number(count);

  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  res.json({
    products: rows.map(r => formatProduct(r.p, r.catName)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/products/featured", async (_req, res) => {
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isFeatured, true))
    .orderBy(desc(productsTable.rating))
    .limit(8);
  res.json(rows.map(r => formatProduct(r.p, r.catName)));
});

router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, parsed.data.id))
    .limit(1);
  if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatProduct(rows[0].p, rows[0].catName));
});

router.post("/products", requireAdmin, async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { comparePrice, isFeatured, images, ...rest } = parsed.data;
  const [product] = await db.insert(productsTable).values({
    ...rest,
    price: String(rest.price),
    comparePrice: comparePrice != null ? String(comparePrice) : null,
    isFeatured: isFeatured ?? false,
    images: images ?? [],
  }).returning();
  res.status(201).json(formatProduct(product));
});

router.patch("/products/:id", requireAdmin, async (req, res) => {
  const params = UpdateProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { comparePrice, price, ...rest } = parsed.data;
  const updates: any = { ...rest };
  if (price != null) updates.price = String(price);
  if (comparePrice !== undefined) updates.comparePrice = comparePrice != null ? String(comparePrice) : null;
  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatProduct(product));
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;

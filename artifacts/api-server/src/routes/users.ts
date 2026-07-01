import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, like, sql, and } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { ListUsersQueryParams, UpdateProfileBody, UpdateUserBody, UpdateUserParams, DeleteUserParams } from "@workspace/api-zod";

const router = Router();

function formatUser(u: any) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatarUrl: u.avatarUrl, createdAt: u.createdAt?.toISOString?.() ?? u.createdAt };
}

router.get("/users", requireAdmin, async (req, res) => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  const page = parsed.success ? (parsed.data.page ?? 1) : 1;
  const search = parsed.success ? parsed.data.search : undefined;
  const limit = 20;

  const conditions = search ? [like(usersTable.name, `%${search}%`)] : [];
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(where);
  const total = Number(count);
  const rows = await db.select().from(usersTable).where(where).limit(limit).offset((page - 1) * limit);
  res.json({ users: rows.map(formatUser), total, page, totalPages: Math.ceil(total / limit) });
});

router.patch("/users/profile", requireAuth, async (req: AuthRequest, res) => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, req.userId!)).returning();
  res.json(formatUser(user));
});

router.patch("/users/:id", requireAdmin, async (req, res) => {
  const params = UpdateUserParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(user));
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteUserParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;

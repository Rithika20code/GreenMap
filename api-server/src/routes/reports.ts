import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wasteReportsTable, insertWasteReportSchema } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/reports", async (req, res) => {
  const { category, status, limit = "50", offset = "0" } = req.query;

  const conditions = [];
  if (category) conditions.push(eq(wasteReportsTable.category, category as string));
  if (status) conditions.push(eq(wasteReportsTable.status, status as string));

  const query = db
    .select()
    .from(wasteReportsTable)
    .orderBy(desc(wasteReportsTable.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(wasteReportsTable);

  if (conditions.length > 0) {
    const [reports, [{ count }]] = await Promise.all([
      query.where(conditions.reduce((a, b) => sql`${a} AND ${b}`)),
      countQuery.where(conditions.reduce((a, b) => sql`${a} AND ${b}`)),
    ]);
    return res.json({ reports, total: Number(count) });
  }

  const [reports, [{ count }]] = await Promise.all([query, countQuery]);
  return res.json({ reports, total: Number(count) });
});

router.get("/reports/hotspots", async (req, res) => {
  const reports = await db
    .select({
      latitude: wasteReportsTable.latitude,
      longitude: wasteReportsTable.longitude,
      category: wasteReportsTable.category,
    })
    .from(wasteReportsTable)
    .where(eq(wasteReportsTable.status, "pending"));

  const clusters: Record<string, { lat: number; lng: number; categories: string[]; count: number }> = {};

  for (const report of reports) {
    const gridLat = Math.round(report.latitude * 10) / 10;
    const gridLng = Math.round(report.longitude * 10) / 10;
    const key = `${gridLat},${gridLng}`;
    if (!clusters[key]) {
      clusters[key] = { lat: gridLat, lng: gridLng, categories: [], count: 0 };
    }
    clusters[key].count++;
    if (!clusters[key].categories.includes(report.category)) {
      clusters[key].categories.push(report.category);
    }
  }

  const hotspots = Object.values(clusters).map((c) => ({
    latitude: c.lat,
    longitude: c.lng,
    count: c.count,
    severity: c.count >= 5 ? "high" : c.count >= 3 ? "medium" : "low",
    categories: c.categories,
  }));

  return res.json({ hotspots });
});

router.post("/reports", async (req, res) => {
  const parsed = insertWasteReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const [report] = await db
    .insert(wasteReportsTable)
    .values(parsed.data)
    .returning();

  return res.status(201).json(report);
});

router.get("/reports/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [report] = await db
    .select()
    .from(wasteReportsTable)
    .where(eq(wasteReportsTable.id, id));

  if (!report) return res.status(404).json({ error: "Report not found" });
  return res.json(report);
});

router.patch("/reports/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { status } = req.body;
  if (!["pending", "in_progress", "resolved"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const [report] = await db
    .update(wasteReportsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(wasteReportsTable.id, id))
    .returning();

  if (!report) return res.status(404).json({ error: "Report not found" });
  return res.json(report);
});

export default router;

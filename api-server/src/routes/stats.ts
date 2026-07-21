import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wasteReportsTable, recyclingCentersTable, announcementsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res) => {
  const [reportsStats] = await db
    .select({
      total: sql<number>`count(*)`,
      resolved: sql<number>`sum(case when status = 'resolved' then 1 else 0 end)`,
      pending: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
      inProgress: sql<number>`sum(case when status = 'in_progress' then 1 else 0 end)`,
    })
    .from(wasteReportsTable);

  const [centersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(recyclingCentersTable);

  const [announcementsStats] = await db
    .select({
      active: sql<number>`count(*)`,
      totalVolunteers: sql<number>`sum(volunteers_signed_up)`,
    })
    .from(announcementsTable)
    .where(sql`event_date > now()`);

  const total = Number(reportsStats.total) || 0;
  const resolved = Number(reportsStats.resolved) || 0;

  return res.json({
    totalReports: total,
    resolvedReports: resolved,
    pendingReports: Number(reportsStats.pending) || 0,
    inProgressReports: Number(reportsStats.inProgress) || 0,
    totalRecyclingCenters: Number(centersCount.count) || 0,
    activeCleanupDrives: Number(announcementsStats?.active) || 0,
    totalVolunteers: Number(announcementsStats?.totalVolunteers) || 0,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
  });
});

router.get("/stats/by-category", async (_req, res) => {
  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(wasteReportsTable);

  const total = Number(totalRow.total) || 1;

  const categoryCounts = await db
    .select({
      category: wasteReportsTable.category,
      count: sql<number>`count(*)`,
    })
    .from(wasteReportsTable)
    .groupBy(wasteReportsTable.category);

  const data = categoryCounts.map((row) => ({
    category: row.category,
    count: Number(row.count),
    percentage: Math.round((Number(row.count) / total) * 100),
  }));

  return res.json({ data });
});

router.get("/stats/recent-activity", async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const recentReports = await db
    .select({
      id: wasteReportsTable.id,
      type: sql<string>`'report_submitted'`,
      title: sql<string>`concat('New report: ', title)`,
      description: wasteReportsTable.description,
      timestamp: wasteReportsTable.createdAt,
      userName: wasteReportsTable.reporterName,
    })
    .from(wasteReportsTable)
    .orderBy(desc(wasteReportsTable.createdAt))
    .limit(limit);

  const resolvedReports = await db
    .select({
      id: wasteReportsTable.id,
      type: sql<string>`'report_resolved'`,
      title: sql<string>`concat('Resolved: ', title)`,
      description: wasteReportsTable.description,
      timestamp: wasteReportsTable.updatedAt,
      userName: wasteReportsTable.reporterName,
    })
    .from(wasteReportsTable)
    .where(eq(wasteReportsTable.status, "resolved"))
    .orderBy(desc(wasteReportsTable.updatedAt))
    .limit(Math.ceil(limit / 2));

  const recentAnnouncements = await db
    .select({
      id: announcementsTable.id,
      type: sql<string>`'cleanup_announced'`,
      title: sql<string>`concat('Cleanup drive: ', title)`,
      description: announcementsTable.description,
      timestamp: announcementsTable.createdAt,
      userName: announcementsTable.organizer,
    })
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.createdAt))
    .limit(Math.ceil(limit / 3));

  const combined = [
    ...recentReports,
    ...resolvedReports,
    ...recentAnnouncements,
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return res.json({ activities: combined });
});

export default router;

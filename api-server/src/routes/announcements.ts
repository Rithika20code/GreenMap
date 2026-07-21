import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { announcementsTable, insertAnnouncementSchema } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/announcements", async (_req, res) => {
  const announcements = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.eventDate));
  return res.json({ announcements });
});

router.post("/announcements", async (req, res) => {
  const parsed = insertAnnouncementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const [announcement] = await db
    .insert(announcementsTable)
    .values(parsed.data)
    .returning();

  return res.status(201).json(announcement);
});

export default router;

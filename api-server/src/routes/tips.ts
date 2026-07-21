import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { recyclingTipsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/tips", async (_req, res) => {
  const tips = await db.select().from(recyclingTipsTable);
  return res.json({ tips });
});

export default router;

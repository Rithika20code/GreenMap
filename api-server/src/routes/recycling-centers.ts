import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { recyclingCentersTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/recycling-centers", async (_req, res) => {
  const centers = await db.select().from(recyclingCentersTable);
  return res.json({ centers });
});

export default router;

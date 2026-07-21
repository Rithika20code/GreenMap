import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reportsRouter from "./reports";
import recyclingCentersRouter from "./recycling-centers";
import announcementsRouter from "./announcements";
import tipsRouter from "./tips";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reportsRouter);
router.use(recyclingCentersRouter);
router.use(announcementsRouter);
router.use(tipsRouter);
router.use(statsRouter);

export default router;

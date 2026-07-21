import { pgTable, serial, text, real, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wasteCategoryEnum = pgEnum("waste_category", [
  "overflowing_bin",
  "illegal_dumping",
  "litter",
  "hazardous",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "in_progress",
  "resolved",
]);

export const wasteReportsTable = pgTable("waste_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: wasteCategoryEnum("category").notNull(),
  status: reportStatusEnum("status").notNull().default("pending"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  imageUrl: text("image_url"),
  reporterName: text("reporter_name").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWasteReportSchema = createInsertSchema(wasteReportsTable).omit({
  id: true,
  upvotes: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWasteReport = z.infer<typeof insertWasteReportSchema>;
export type WasteReport = typeof wasteReportsTable.$inferSelect;

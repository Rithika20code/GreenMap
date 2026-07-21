import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recyclingTipsTable = pgTable("recycling_tips", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  icon: text("icon").notNull(),
});

export const insertRecyclingTipSchema = createInsertSchema(recyclingTipsTable).omit({
  id: true,
});

export type InsertRecyclingTip = z.infer<typeof insertRecyclingTipSchema>;
export type RecyclingTip = typeof recyclingTipsTable.$inferSelect;

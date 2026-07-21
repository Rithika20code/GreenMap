import { pgTable, serial, text, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recyclingCentersTable = pgTable("recycling_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  acceptedMaterials: text("accepted_materials").array().notNull(),
  operatingHours: text("operating_hours").notNull(),
  phone: text("phone"),
  isOpen: boolean("is_open").notNull().default(true),
});

export const insertRecyclingCenterSchema = createInsertSchema(recyclingCentersTable).omit({
  id: true,
});

export type InsertRecyclingCenter = z.infer<typeof insertRecyclingCenterSchema>;
export type RecyclingCenter = typeof recyclingCentersTable.$inferSelect;

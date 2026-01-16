import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
// Import auth models to extend/use them
export * from "./models/auth";
import { users } from "./models/auth";

// === CALIBRATION ===
export const calibrations = pgTable("calibrations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  wristVelocity: doublePrecision("wrist_velocity").notNull(),
  elbowAngle: doublePrecision("elbow_angle").notNull(),
  shoulderRotation: doublePrecision("shoulder_rotation").notNull(),
  headVerticalDisplacement: doublePrecision("head_vertical_displacement").notNull(),
  hipDisplacement: doublePrecision("hip_displacement").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalibrationSchema = createInsertSchema(calibrations).omit({ 
  id: true, 
  createdAt: true,
  userId: true // set by backend from session
});

export type Calibration = typeof calibrations.$inferSelect;
export type InsertCalibration = z.infer<typeof insertCalibrationSchema>;

// === MATCH HISTORY ===
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  opponentName: text("opponent_name").notNull(),
  result: text("result").notNull(), // 'win', 'loss', 'draw'
  score: integer("score").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  punchesThrown: integer("punches_thrown").notNull(),
  punchesLanded: integer("punches_landed").notNull(),
  dodges: integer("dodges").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({ 
  id: true, 
  createdAt: true,
  userId: true 
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// === RELATIONS ===
export const calibrationsRelations = relations(calibrations, ({ one }) => ({
  user: one(users, {
    fields: [calibrations.userId],
    references: [users.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  user: one(users, {
    fields: [matches.userId],
    references: [users.id],
  }),
}));

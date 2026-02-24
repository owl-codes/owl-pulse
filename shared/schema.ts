import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We'll keep a simple users table just in case we want to add preferences later
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Portfolio table to store user holdings
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coinId: text("coin_id").notNull(),
  amount: text("amount").notNull().default("0"),
});

export const insertPortfolioSchema = createInsertSchema(portfolio).omit({ id: true });
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolio.$inferSelect;

export const coinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  change24h: z.number().nullable(),
  sparkline: z.array(z.number()),
});

export type Coin = z.infer<typeof coinSchema>;

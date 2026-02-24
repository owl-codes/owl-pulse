import { users, portfolio, type User, type InsertUser, type Portfolio, type InsertPortfolio } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPortfolio(userId: number): Promise<Portfolio[]>;
  updatePortfolio(userId: number, coinId: string, amount: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPortfolio(userId: number): Promise<Portfolio[]> {
    return await db.select().from(portfolio).where(eq(portfolio.userId, userId));
  }

  async updatePortfolio(userId: number, coinId: string, amount: string): Promise<void> {
    const [existing] = await db.select().from(portfolio).where(
      and(eq(portfolio.userId, userId), eq(portfolio.coinId, coinId))
    );

    if (existing) {
      await db.update(portfolio)
        .set({ amount })
        .where(eq(portfolio.id, existing.id));
    } else {
      await db.insert(portfolio).values({
        userId,
        coinId,
        amount
      });
    }
  }
}

export const storage = new DatabaseStorage();

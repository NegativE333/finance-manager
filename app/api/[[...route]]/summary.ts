import { db } from '@/db/drizzle';
import { accounts, categories, transactions } from '@/db/schema';
import { calculatePercentageChange, fillMissingDays } from '@/lib/utils';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { differenceInDays, parse, subDays } from 'date-fns';
import { and, desc, eq, gte, lt, lte, sql, sum } from 'drizzle-orm';
import {Hono} from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        zValidator(
            "query",
            z.object({
                from: z.string().optional(),
                to: z.string().optional(),
                accountId: z.string().optional(),
            }),
        ),
        async (c) => {
            const auth = getAuth(c);
            const {from, to, accountId} = c.req.valid("query");

            if(!auth?.userId){
                return c.json({error : "Unauthorized"}, 401);
            }
            
            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 30);

            const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;

            const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

            const periodLength = differenceInDays(endDate, startDate)+1;
            const lastPeriodStart = subDays(startDate, periodLength);
            const lastPeriodEnd = subDays(endDate, periodLength);

            async function fetchFinancialData(
                userId: string,
                startDate: Date,
                endDate: Date 
            ) {
                return await db.select({
                    income: sql`sum(case when ${transactions.amount} >= 0 then ${transactions.amount} else 0 end)`.mapWith(Number),
                    expenses: sql`sum(case when ${transactions.amount} < 0 then ${transactions.amount} else 0 end)`.mapWith(Number),
                    remaining: sum(transactions.amount).mapWith(Number),
                })
                .from(transactions)
                .innerJoin(
                    accounts,
                    eq(
                        transactions.accountId,
                        accounts.id
                    ),
                )
                .where(
                    and(
                        accountId ? eq(transactions.accountId, accountId) : undefined,
                        eq(accounts.userId, userId),
                        gte(transactions.date, startDate),
                        lte(transactions.date, endDate)
                    )
                );
            }

            const [currPeriod] = await fetchFinancialData(
                auth.userId,
                startDate,
                endDate
            );

            const [lastPeriod] = await fetchFinancialData(
                auth.userId,
                lastPeriodStart,
                lastPeriodEnd
            );

            const incomeChange = calculatePercentageChange(currPeriod.income, lastPeriod.income);

            const expenseChange = calculatePercentageChange(currPeriod.expenses, lastPeriod.expenses);

            const remainingChange = calculatePercentageChange(currPeriod.remaining, lastPeriod.remaining);

            const category = await db.select({
                name: categories.name,
                value: sql`sum(abs(${transactions.amount}))`.mapWith(Number)
            })
            .from(transactions)
            .innerJoin(
                accounts, 
                eq(
                    transactions.accountId, 
                    accounts.id
                )
            )
            .innerJoin(
                categories, 
                eq(
                    transactions.categoryId, 
                    categories.id
                )
            )
            .where(
                and(
                    accountId ? eq(transactions.accountId, accountId) : undefined,
                        eq(accounts.userId, auth.userId),
                        lt(transactions.amount, 0),
                        gte(transactions.date, startDate),
                        lte(transactions.date, endDate)
                )
            )
            .groupBy(categories.name)
            .orderBy(desc(
                sql`sum(abs(${transactions.amount}))`
            ))

            const topCategories = category.slice(0, 3);
            const othCategories = category.slice(3);
            const othSum = othCategories.reduce((sum, curr) => sum + curr.value, 0);

            const finalCategories = topCategories;
            if(othCategories.length > 0){
                finalCategories.push({
                    name: "Other",
                    value: othSum
                })
            }

            const activeDays = await db.select({
                date: transactions.date,
                income: sql`sum(case when ${transactions.amount} >= 0 then ${transactions.amount} else 0 end)`.mapWith(Number),
                expenses: sql`sum(case when ${transactions.amount} < 0 then ${transactions.amount} else 0 end)`.mapWith(Number),
            })
            .from(transactions)
            .innerJoin(
                accounts, 
                eq(
                    transactions.accountId, 
                    accounts.id
                )
            )
            .where(
                and(
                    accountId ? eq(transactions.accountId, accountId) : undefined,
                        eq(accounts.userId, auth.userId),
                        gte(transactions.date, startDate),
                        lte(transactions.date, endDate)
                )
            )
            .groupBy(transactions.date)
            .orderBy(transactions.date)

            const days = fillMissingDays(
                activeDays,
                startDate,
                endDate
            )

            return c.json({
                data: {
                    remainingAmount: currPeriod.remaining,
                    remainingChange,
                    incomeAmount: currPeriod.income,
                    incomeChange,
                    expensesAmount: currPeriod.expenses,
                    expenseChange,
                    categories: finalCategories,
                    days,
                }
            });
        }
    )


export default app;
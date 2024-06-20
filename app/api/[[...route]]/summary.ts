import { db } from '@/db/drizzle';
import { accounts, transactions } from '@/db/schema';
import { calculatePercentageChange } from '@/lib/utils';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { differenceInDays, parse, subDays } from 'date-fns';
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm';
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
                    expense: sql`sum(case when ${transactions.amount} < 0 then ${transactions.amount} else 0 end)`.mapWith(Number),
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
                startDate,
                endDate
            );

            const incomeChange = calculatePercentageChange(currPeriod.income, lastPeriod.income);

            const expenseChange = calculatePercentageChange(currPeriod.expense, lastPeriod.expense);

            const remainingChange = calculatePercentageChange(currPeriod.remaining, lastPeriod.remaining);

            return c.json({
                currPeriod,
                lastPeriod,
                incomeChange,
                expenseChange,
                remainingChange
            })
        }
    )


export default app;
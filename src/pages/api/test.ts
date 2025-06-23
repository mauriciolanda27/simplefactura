// pages/api/test.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
}

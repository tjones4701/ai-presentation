import { kv } from "@vercel/kv";

export function getCachedValue<T>(key: string): Promise<T | null> {
    const redisKey = key;
    return kv.get<T>(redisKey)
}


export async function setCachedValue<T = any>(key: string, data: T): Promise<void> {
    const redisKey = key;
    await kv.set<T>(redisKey, data);
}
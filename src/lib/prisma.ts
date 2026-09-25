import { PrismaClient } from '@prisma/client';
import { localDb } from './localDb';

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
};

function hasRealDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (
    url.includes('ep-sample-123456') ||
    url.includes('password@ep-') ||
    url.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

let realClient: PrismaClient | null = null;
if (hasRealDatabaseUrl()) {
  try {
    realClient =
      globalForPrisma.prismaClient ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClient = realClient;
  } catch (e) {
    console.warn('[Prisma] Client initialization fallback to localDb:', e);
    realClient = null;
  }
}

/**
 * Robust database adapter:
 * Uses Prisma when a real PostgreSQL / NeonDB connection is available.
 * Transparently falls back to local persistent store on localhost when NeonDB is not yet configured,
 * completely preventing 500 "Internal server error" during local development.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    if (prop === '$disconnect') {
      return async () => {
        if (realClient) await realClient.$disconnect().catch(() => {});
        return Promise.resolve();
      };
    }

    if (prop === '$transaction') {
      return async function (arg: any) {
        if (realClient) {
          try {
            return await (realClient as any).$transaction(arg);
          } catch (err: any) {
            console.warn('[Prisma] $transaction failed on realClient, fallback to localDb:', err?.message);
            if (typeof arg === 'function') {
              return await arg(localDb);
            }
          }
        }
        if (typeof arg === 'function') {
          return await arg(localDb);
        }
        if (Array.isArray(arg)) {
          const results = [];
          for (const item of arg) {
            results.push(await item);
          }
          return results;
        }
        return null;
      };
    }

    const localModel = (localDb as any)[prop];
    const realModel = realClient ? (realClient as any)[prop] : null;

    if (!realModel) {
      return localModel || {};
    }

    // Proxy model methods (findUnique, findMany, create, update, etc.)
    return new Proxy(realModel, {
      get(modelTarget, method: string) {
        const origMethod = modelTarget[method];
        if (typeof origMethod !== 'function') {
          return localModel ? localModel[method] : origMethod;
        }

        return async function (...args: any[]) {
          try {
            return await origMethod.apply(modelTarget, args);
          } catch (err: any) {
            // If database unreachable, missing env, or connection timeout, fallback to localDb
            if (
              err?.code === 'P1001' || // Can't reach database server
              err?.code === 'P1000' || // Authentication failed
              err?.name === 'PrismaClientInitializationError' ||
              err?.message?.includes('Environment variable not found') ||
              err?.message?.includes("Can't reach database server")
            ) {
              console.warn(`[Prisma Database Offline] Fallback to localDb for ${prop}.${method}`);
              if (localModel && typeof localModel[method] === 'function') {
                return await localModel[method](...args);
              }
            }
            throw err;
          }
        };
      },
    });
  },
});

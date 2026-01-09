import NodeCache from 'node-cache';

const jsonCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 300,
  useClones: false,
});

const getCacheKey = (endpoint: string, clientId: string, from: string, to: string) => {
  return `${endpoint}:${clientId}:${from}:${to}`;
};

const cacheData = (key: string, data: any) => {
  jsonCache.set(key, data);
};

const getCachedData = (key: string) => {
  return jsonCache.get(key) || null;
};

const clearCache = (key?: string) => {
  if (key) {
    jsonCache.del(key);
    return;
  }

  jsonCache.flushAll();
};

export { jsonCache, getCacheKey, cacheData, getCachedData, clearCache }

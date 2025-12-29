import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({
  path: '../../../../.env',
});

export const routeConfigSchema = z.object({
  ACCOUNT_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),
 ACCOUNT_HOST: z.string().min(1).default('localhost'),

  ORGANIZATION_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),
  ORGANIZATION_HOST: z.string().min(1).default('localhost'),

  FEATURE_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),
  FEATURE_HOST: z.string().min(1).default('localhost'),

  WORKSPACE_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),
  WORKSPACE_HOST: z.string().min(1).default('localhost'),

  LOCATION_TRACKER_DEVICE_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),
  LOCATION_TRACKER_DEVICE_HOST: z
    .string()
    .min(1)
    .default('localhost'),

  LOCATION_TRACKER_TRACKING_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(2002),
  LOCATION_TRACKER_TRACKING_HOST: z
    .string()
    .min(1)
    .default('localhost'),

  LOCATION_TRACKER_NOTIFIER_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4003),
  LOCATION_TRACKER_NOTIFIER_HOST: z
    .string()
    .min(1)
    .default('localhost'),
});

export const routeEnv = routeConfigSchema.parse(
  process.env,
);

// Define routes that map to different services
// For load balancing, you can provide multiple URLs in an array
export const serviceRoutes: Record<
  string,
  string | string[]
> = {
  '/api/account': `http://${routeEnv.ACCOUNT_HOST}:${routeEnv.ACCOUNT_PORT}`,
  '/api/organization': `http://${routeEnv.ORGANIZATION_HOST}:${routeEnv.ORGANIZATION_PORT}`,
  '/api/feature': `http://${routeEnv.FEATURE_HOST}:${routeEnv.FEATURE_PORT}`,
  '/api/workspace': `http://${routeEnv.WORKSPACE_HOST}:${routeEnv.WORKSPACE_PORT}`,
  '/api/location-tracker-device': `http://${routeEnv.LOCATION_TRACKER_DEVICE_HOST}:${routeEnv.LOCATION_TRACKER_DEVICE_PORT}`,
  '/api/location-tracker-tracking': `http://${routeEnv.LOCATION_TRACKER_TRACKING_HOST}:${routeEnv.LOCATION_TRACKER_TRACKING_PORT}`,
  '/api/location-tracker-notifier': `http://${routeEnv.LOCATION_TRACKER_NOTIFIER_HOST}:${routeEnv.LOCATION_TRACKER_NOTIFIER_PORT}`,
};

export const serviceUrlsSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).nonempty(),
]);

export const serviceRoutesSchema = z.record(
  z.string(),
  serviceUrlsSchema,
);

export type ServiceRoutes = z.infer<
  typeof serviceRoutesSchema
>;

// Load balancing strategies
export enum LoadBalanceStrategy {
  ROUND_ROBIN = 'round-robin',
  RANDOM = 'random',
  LEAST_CONNECTIONS = 'least-connections',
}

// Round-robin counters for each service
const roundRobinCounters = new Map<string, number>();

/**
 * Find which service a path should route to
 * Supports load balancing if multiple URLs are provided
 * Returns service URL and the matched prefix
 */
export function findServiceUrl(
  path: string,
  strategy: LoadBalanceStrategy = LoadBalanceStrategy.ROUND_ROBIN,
): { url: string; prefix: string } | null {
  for (const [prefix, serviceUrls] of Object.entries(
    serviceRoutes,
  )) {
    if (path.startsWith(prefix)) {
      let selectedUrl: string;

      // If single URL, use it
      if (typeof serviceUrls === 'string') {
        selectedUrl = serviceUrls;
      } else if (
        Array.isArray(serviceUrls) &&
        serviceUrls.length > 0
      ) {
        // If multiple URLs, apply load balancing
        selectedUrl = selectServiceUrl(
          prefix,
          serviceUrls,
          strategy,
        );
      } else {
        continue;
      }

      return { url: selectedUrl, prefix };
    }
  }
  return null;
}

/**
 * Select a service URL based on load balancing strategy
 */
function selectServiceUrl(
  prefix: string,
  urls: string[],
  strategy: LoadBalanceStrategy,
): string {
  switch (strategy) {
    case LoadBalanceStrategy.ROUND_ROBIN:
      const currentIndex =
        roundRobinCounters.get(prefix) || 0;
      const selectedIndex = currentIndex % urls.length;
      roundRobinCounters.set(
        prefix,
        (currentIndex + 1) % urls.length,
      );
      return urls[selectedIndex]!;

    case LoadBalanceStrategy.RANDOM:
      return urls[Math.floor(Math.random() * urls.length)]!;

    case LoadBalanceStrategy.LEAST_CONNECTIONS:
      // For simplicity, fallback to round-robin
      // In production, you'd track active connections per service
      const index = roundRobinCounters.get(prefix) || 0;
      roundRobinCounters.set(
        prefix,
        (index + 1) % urls.length,
      );
      return urls[index % urls.length]!;

    default:
      return urls[0]!;
  }
}

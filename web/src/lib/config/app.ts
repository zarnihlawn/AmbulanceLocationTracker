import { env } from '$env/dynamic/public';

/**
 * Global app configuration
 * App name comes from PUBLIC_APP_NAME env var, with a fallback.
 */
export const APP_NAME = env.PUBLIC_APP_NAME;

const RAILWAY_DEFAULT = "https://misterteedata-production.up.railway.app";

/**
 * Backend origin (no trailing slash).
 * Defaults to Railway. Set `VITE_API_BASE_URL` only if you need another host (e.g. local API).
 */
export function getApiBaseUrl(): string {
	const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
	if (fromEnv) {
		return fromEnv.replace(/\/$/, "");
	}
	return RAILWAY_DEFAULT;
}

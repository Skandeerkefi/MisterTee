const RAILWAY_DEFAULT = "https://misterteedata-production.up.railway.app";

/**
 * Backend origin (no trailing slash).
 * Defaults to Railway production so every build hits the live API.
 * Override locally with `VITE_API_BASE_URL=http://localhost:3000`.
 */
export function getApiBaseUrl(): string {
	const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
	if (fromEnv) {
		return fromEnv.replace(/\/$/, "");
	}
	return RAILWAY_DEFAULT;
}

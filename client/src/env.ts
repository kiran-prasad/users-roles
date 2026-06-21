// Single env var, single-line default. No startup validator necessary — the
// fallback matches the server's documented port.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3002'

export type HealthResponse = { status: 'ok'; database: 'ok'; schemaVersion: 1 };

export function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== 'object' || value === null) return false;
  return 'status' in value && value.status === 'ok'
    && 'database' in value && value.database === 'ok'
    && 'schemaVersion' in value && value.schemaVersion === 1;
}

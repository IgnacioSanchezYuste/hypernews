/**
 * Environment contract.
 *
 * Every value is read through a getter so a missing variable fails loudly at
 * the moment it is needed instead of silently degrading. That matters most for
 * SESSION_SECRET: an empty value would still produce signable JWTs, and every
 * session cookie on the site would be forgeable.
 */

const MIN_SECRET_LENGTH = 32;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copia .env.example y complétala.`);
  }
  return value;
}

function requiredSecret(name: string): string {
  const value = required(name);
  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `${name} es demasiado corta (${value.length} caracteres). Usa al menos ${MIN_SECRET_LENGTH}: openssl rand -base64 48`
    );
  }
  if (/^change-this/i.test(value)) {
    throw new Error(`${name} sigue con el valor de ejemplo. Genera uno propio antes de desplegar.`);
  }
  return value;
}

export const env = {
  get databaseUrl(): string {
    return required("DATABASE_URL");
  },
  get sessionSecret(): string {
    return requiredSecret("SESSION_SECRET");
  },
  /** Optional: when unset, the cron endpoint refuses every request. */
  get cronSecret(): string | undefined {
    const value = process.env.CRON_SECRET?.trim();
    return value && value.length >= MIN_SECRET_LENGTH ? value : undefined;
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
};

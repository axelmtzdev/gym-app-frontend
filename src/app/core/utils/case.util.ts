function camelASnake(clave: string): string {
  return clave.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`);
}

export function aSnakeCase<T = unknown>(valor: unknown): T {
  if (Array.isArray(valor)) {
    return valor.map((v) => aSnakeCase(v)) as unknown as T;
  }
  if (valor !== null && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([k, v]) => [camelASnake(k), aSnakeCase(v)]),
    ) as T;
  }
  return valor as T;
}

export async function request(path, options = {}) {
  const { body, ...rest } = options;
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin', ...rest,
    headers: { 'Content-Type': 'application/json', ...rest.headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a operação.');
  return result;
}

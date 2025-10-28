export const BASE_URL = "http://localhost:8080";

export async function exchangeToken(code: string) {
  const res = await fetch(`${BASE_URL}/exchange/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

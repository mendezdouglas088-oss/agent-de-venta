export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

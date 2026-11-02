// A POST or PATCH to the operator API; resolves with the JSON answer. A 401 means the session ended: the browser goes back to
// the sign-in page and this resolves with null. Any other failure throws, so the caller can show its own message.
export const send = async (url, method, body) => {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401) {
    window.location.replace("/operator/login?expired=1");
    return null;
  }
  if (!response.ok) throw new Error("rejected");
  return response.json();
};

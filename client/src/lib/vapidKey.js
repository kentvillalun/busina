// The server's VAPID public key is URL-safe base64; pushManager.subscribe wants the raw bytes.
// A VAPID public key is 65 bytes (an uncompressed P-256 point, first byte 0x04).
export const urlBase64ToBytes = (base64) => {
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

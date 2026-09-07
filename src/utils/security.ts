/**
 * Utilitas keamanan sederhana untuk proteksi PIN/Kata Sandi link
 */

export async function hashPinCode(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPinCode(inputPin: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPinCode(inputPin);
  return inputHash === storedHash;
}

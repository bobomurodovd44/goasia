// Simple hash function that works in React Native
export async function hashFileName(originalFilename: string): Promise<string> {
  const fileExtension = originalFilename.split('.').pop() || 'jpg';
  const salt = Math.random().toString(36).substring(2, 18);
  const data = `${originalFilename}-${Date.now()}-${salt}`;

  // Simple hash using JavaScript's String charCodeAt
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const hashHex = Math.abs(hash).toString(16);
  return `${hashHex}-${salt}.${fileExtension}`;
}

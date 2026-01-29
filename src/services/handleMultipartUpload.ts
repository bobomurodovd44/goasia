import feathersClient from './feathersClient';
import { hashFileName } from './hashFileName';

const CHUNK_SIZE = 5 * 1024 * 1024;

function getMimeType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  return mimeTypes[ext || 'jpg'] || 'image/jpeg';
}

function getExtension(uri: string): string {
  return uri.split('.').pop()?.toLowerCase() || 'jpg';
}

export async function uploadFileMultipart(
  uri: string,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  // Detect actual MIME type and extension from URI
  const detectedMimeType = getMimeType(uri);
  const extension = getExtension(uri);

  // 1. Fetch blob from URI
  const response = await fetch(uri);
  const blob = await response.blob();
  const fileSize = blob.size;

  // 2. Hash filename with correct extension
  const filename = await hashFileName(`image.${extension}`);

  // 3. Initialize multipart upload
  const initResponse = await feathersClient.service('uploads').create({
    key: filename,
    contentType: detectedMimeType,
  });
  const { uploadId, key } = initResponse;

  // 4. Upload chunks
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
  const parts = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(fileSize, start + CHUNK_SIZE);
    const chunk = blob.slice(start, end);

    const chunkData = await readChunkAsArrayBuffer(chunk);
    const base64Content = `data:${detectedMimeType};base64,${arrayBufferToBase64(chunkData)}`;

    const partResponse = await feathersClient.service('uploads').patch(null, {
      partNumber: i + 1,
      uploadId,
      key,
      content: base64Content,
    });

    parts.push({ ETag: partResponse.ETag, PartNumber: i + 1 });
    onProgress?.(Math.round(((i + 1) / totalChunks) * 100));
  }

  // 5. Complete upload (returns media _id)
  const result = await feathersClient.service('uploads').update(null, {
    uploadId,
    key,
    parts,
    fileType: detectedMimeType,
  });

  return result as string;
}

function readChunkAsArrayBuffer(chunk: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(chunk);
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

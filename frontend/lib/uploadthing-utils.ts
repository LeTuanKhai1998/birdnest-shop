/**
 * UploadThing URL utilities
 */

export interface UploadThingFile {
  name: string;
  size: number;
  url?: string;
  ufsUrl?: string;
  serverUrl?: string;
}

/**
 * Get the best available URL from an UploadThing file response
 * Priority: ufsUrl > url > serverUrl
 */
export function getUploadThingUrl(file: UploadThingFile): string {
  const url = file.ufsUrl || file.url || file.serverUrl;
  if (!url) {
    throw new Error(`No URL available for file: ${file.name}`);
  }
  return url;
}

/**
 * Get multiple URLs from UploadThing response
 */
export function getUploadThingUrls(files: UploadThingFile[]): string[] {
  return files.map(getUploadThingUrl);
}

/**
 * Check if a URL is from UploadThing CDN
 */
export function isUploadThingUrl(url: string): boolean {
  return url.includes('utfs.io') || url.includes('.ufs.sh') || url.includes('uploadthing.com');
}

/**
 * Get file extension from UploadThing URL (if available in filename)
 */
export function getFileExtension(url: string, filename?: string): string {
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
      return ext;
    }
  }
  
  // Try to extract from URL path
  const urlExt = url.split('.').pop()?.toLowerCase();
  if (urlExt && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(urlExt)) {
    return urlExt;
  }
  
  return 'unknown';
}

/**
 * Format UploadThing URL for display
 */
export function formatUploadThingUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.hostname}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

/**
 * Get UploadThing CDN domain from URL
 */
export function getUploadThingDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
} 
import imageCompression from 'browser-image-compression';

// Filename convention: [type]-[entityId]-[timestamp].[ext]
export interface UploadFilenameConfig {
  type: 'avatar' | 'product' | 'general';
  entityId: string; // userId, productId, etc.
  originalName: string;
  timestamp?: number;
}

/**
 * Generate a standardized filename for uploads
 * Format: [type]-[entityId]-[timestamp].[ext]
 * Examples: avatar-user123-20250729.jpg, product-456-1722260100.png
 */
export function generateUploadFilename(config: UploadFilenameConfig): string {
  const { type, entityId, originalName, timestamp = Date.now() } = config;
  
  // Get file extension
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Validate extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const validExtension = allowedExtensions.includes(extension) ? extension : 'jpg';
  
  // Clean entityId (remove special characters, convert to lowercase)
  const cleanEntityId = entityId
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  
  // Format timestamp as Unix timestamp
  const timestampStr = Math.floor(timestamp / 1000).toString();
  
  return `${type}-${cleanEntityId}-${timestampStr}.${validExtension}`;
}

/**
 * Compress image before upload to reduce file size
 */
export async function compressImage(
  file: File,
  options: {
    maxWidthOrHeight?: number;
    maxSizeMB?: number;
    useWebWorker?: boolean;
  } = {}
): Promise<File> {
  const {
    maxWidthOrHeight = 1080,
    maxSizeMB = 1.5,
    useWebWorker = true,
  } = options;

  try {
    const compressedFile = await imageCompression(file, {
      maxWidthOrHeight,
      maxSizeMB,
      useWebWorker,
      fileType: 'image/webp', // Convert to WebP for better compression
    });

    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed, using original file:', error);
    return file;
  }
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images only.',
    };
  }

  // Check file size (max 8MB before compression)
  const maxSizeMB = 8;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  return { isValid: true };
}

/**
 * Get file extension from filename or MIME type
 */
export function getFileExtension(filename: string, mimeType?: string): string {
  // Try to get extension from filename first
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (extension && ['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    return extension;
  }
  
  // Fallback to MIME type
  if (mimeType) {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return mimeToExt[mimeType] || 'jpg';
  }
  
  return 'jpg'; // Default fallback
}

/**
 * Convert file to base64 for preview (optional)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique ID for uploads
 */
export function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 
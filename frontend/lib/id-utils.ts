/**
 * Utility functions for handling human-readable IDs
 */

/**
 * Format a readable ID for display
 * @param readableId - The readable ID (e.g., "PROD-2024-001")
 * @param fallbackId - Fallback ID if readableId is not available
 * @returns Formatted ID for display
 */
export function formatReadableId(readableId?: string | null, fallbackId?: string): string {
  if (readableId) {
    return readableId;
  }
  
  if (fallbackId) {
    // If it's a CUID, return the last 8 characters for display
    if (fallbackId.length > 20) {
      return fallbackId.slice(-8).toUpperCase();
    }
    return fallbackId;
  }
  
  return 'N/A';
}

/**
 * Extract the numeric part from a readable ID
 * @param readableId - The readable ID (e.g., "PROD-2024-001")
 * @returns The numeric part (e.g., "001")
 */
export function extractIdNumber(readableId: string): string {
  const match = readableId.match(/\d{3}$/);
  return match ? match[0] : readableId;
}

/**
 * Get the entity type from a readable ID
 * @param readableId - The readable ID (e.g., "PROD-2024-001")
 * @returns The entity type (e.g., "PROD")
 */
export function getEntityType(readableId: string): string {
  const match = readableId.match(/^([A-Z]{3,4})-/);
  return match ? match[1] : 'ID';
}

/**
 * Get a short display version of an ID
 * @param readableId - The readable ID
 * @param fallbackId - Fallback ID if readableId is not available
 * @returns Short display version
 */
export function getShortId(readableId?: string | null, fallbackId?: string): string {
  if (readableId) {
    const entityType = getEntityType(readableId);
    const number = extractIdNumber(readableId);
    return `${entityType}-${number}`;
  }
  
  if (fallbackId) {
    return fallbackId.slice(-6).toUpperCase();
  }
  
  return 'N/A';
}

/**
 * Get a tooltip text for an ID
 * @param readableId - The readable ID
 * @param fallbackId - Fallback ID if readableId is not available
 * @returns Tooltip text
 */
export function getIdTooltip(readableId?: string | null, fallbackId?: string): string {
  if (readableId) {
    return `Full ID: ${readableId}`;
  }
  
  if (fallbackId) {
    return `Internal ID: ${fallbackId}`;
  }
  
  return 'No ID available';
}

/**
 * Check if an ID is a readable ID format
 * @param id - The ID to check
 * @returns True if it's a readable ID format
 */
export function isReadableId(id: string): boolean {
  return /^[A-Z]{3,4}-\d{4}-\d{3}$/.test(id);
}

/**
 * Get entity type label for display
 * @param entityType - The entity type (e.g., "PROD")
 * @returns Human-readable label
 */
export function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    'PROD': 'Product',
    'ORD': 'Order',
    'USR': 'User',
    'CAT': 'Category',
    'REV': 'Review',
  };
  
  return labels[entityType] || entityType;
}

/**
 * Get color class for entity type
 * @param entityType - The entity type (e.g., "PROD")
 * @returns Tailwind CSS color class
 */
export function getEntityTypeColor(entityType: string): string {
  const colors: Record<string, string> = {
    'PROD': 'bg-blue-100 text-blue-800',
    'ORD': 'bg-green-100 text-green-800',
    'USR': 'bg-purple-100 text-purple-800',
    'CAT': 'bg-orange-100 text-orange-800',
    'REV': 'bg-yellow-100 text-yellow-800',
  };
  
  return colors[entityType] || 'bg-gray-100 text-gray-800';
} 
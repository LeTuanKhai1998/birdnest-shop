import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

// Helper function to get entity ID from request or generate one
const getEntityId = (req: Request, metadata: any): string => {
  // Try to get entityId from URL params or request body
  const url = new URL(req.url);
  const entityId = url.searchParams.get('entityId') || metadata.userId || 'default';
  return entityId;
};

// Helper function to generate standardized filename on server side
const generateServerFilename = (type: string, entityId: string, originalName: string): string => {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const validExtension = allowedExtensions.includes(extension) ? extension : 'jpg';
  
  const cleanEntityId = entityId
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  
  const timestampStr = Math.floor(Date.now() / 1000).toString();
  
  return `${type}-${cleanEntityId}-${timestampStr}.${validExtension}`;
};

const f = createUploadthing();

// Simple auth function without complex session handling
const auth = async () => {
  // For now, allow all uploads for testing
  // In production, you would implement proper auth here
  return { id: "test-user" };
};

export const ourFileRouter = {
  // Avatar uploader - single image, 4MB max (increased for better quality)
  avatarUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth();
      const entityId = getEntityId(req, { userId: user.id });
      return { userId: user.id, entityId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Generate standardized filename on server side
      const filename = generateServerFilename('avatar', metadata.entityId, file.name);
      
      console.log(`📁 Avatar upload: ${file.name} → ${filename}`);
      
      return { 
        uploadedBy: metadata.userId,
        filename,
        originalName: file.name,
        entityId: metadata.entityId,
      };
    }),

  // General image uploader - single image, 4MB max (increased for better quality)
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth();
      
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      
      // Generate standardized filename on server side
      const filename = generateServerFilename('general', metadata.userId, file.name);
      
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { 
        uploadedBy: metadata.userId,
        filename,
        originalName: file.name,
      };
    }),

  // Product image uploader - multiple images, 4MB max each (increased for better quality)
  productImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth();
      const entityId = getEntityId(req, { userId: user.id });
      return { userId: user.id, entityId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Generate standardized filename on server side
      const filename = generateServerFilename('product', metadata.entityId, file.name);
      
      console.log(`📁 Product upload: ${file.name} → ${filename}`);
      
      return { 
        uploadedBy: metadata.userId,
        filename,
        originalName: file.name,
        entityId: metadata.entityId,
      };
    }),

  // General image uploader - multiple images, 4MB max each (increased for better quality)
  generalImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth();
      const entityId = getEntityId(req, { userId: user.id });
      return { userId: user.id, entityId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Generate standardized filename on server side
      const filename = generateServerFilename('general', metadata.entityId, file.name);
      
      console.log(`📁 General upload: ${file.name} → ${filename}`);
      
      return { 
        uploadedBy: metadata.userId,
        filename,
        originalName: file.name,
        entityId: metadata.entityId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 
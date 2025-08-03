import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { generateUploadFilename } from "@/lib/upload-utils";

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
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Generate standardized filename
      const filename = generateUploadFilename({
        type: 'avatar',
        entityId: metadata.userId,
        originalName: file.name,
      });
      
      return { 
        uploadedBy: metadata.userId,
        filename,
        originalName: file.name,
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
      
      // Generate standardized filename
      const filename = generateUploadFilename({
        type: 'general',
        entityId: metadata.userId,
        originalName: file.name,
      });
      
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
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Generate standardized filename
      const filename = generateUploadFilename({
        type: 'product',
        entityId: metadata.userId,
        originalName: file.name,
      });
      
      return { 
        uploadedBy: metadata.userId,
        filename,
        originalName: file.name,
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
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Generate standardized filename
      const filename = generateUploadFilename({
        type: 'general',
        entityId: metadata.userId,
        originalName: file.name,
      });
      
      return { 
        uploadedBy: metadata.userId,
        filename,
        originalName: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 
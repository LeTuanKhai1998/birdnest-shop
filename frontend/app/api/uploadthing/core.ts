import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Simple auth function without complex session handling
const auth = async () => {
  // For now, allow all uploads for testing
  // In production, you would implement proper auth here
  return { id: "test-user" };
};

export const ourFileRouter = {
  // Avatar uploader - single image, 2MB max (for profile pictures)
  avatarUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploaded:", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),

  // General image uploader - single image, 4MB max
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
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  // Product image uploader - multiple images, 4MB max each
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
      console.log("Product image uploaded:", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),

  // General image uploader - multiple images, 4MB max each
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
      console.log("General image uploaded:", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 
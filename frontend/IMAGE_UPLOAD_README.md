# Image Upload Implementation with UploadThing

This document describes the image upload functionality implemented in the Birdnest Shop using UploadThing.

## Overview

The image upload system provides secure, scalable file uploads with the following features:
- Multiple upload endpoints (avatar, product images, general images)
- Image compression and optimization
- Preview functionality
- Role-based access control
- File type validation
- Size limits

## Components

### 1. UploadThing Core Configuration (`app/api/uploadthing/core.ts`)

Defines the upload routers with different configurations:

```typescript
export const uploadRouter = {
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    }),

  productImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || !session.user.isAdmin) {
        throw new Error("Admin access required");
      }
      return { userId: session.user.id };
    }),

  generalImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    }),
};
```

### 2. ImageUpload Component (`components/ui/ImageUpload.tsx`)

A reusable component that provides:
- Drag and drop interface
- File validation
- Image compression
- Preview functionality
- Progress indicators

#### Usage:

```tsx
import { ImageUpload } from "@/components/ui/ImageUpload";

<ImageUpload
  endpoint="avatarUploader"
  onUpload={(urls) => console.log('Uploaded:', urls)}
  maxFiles={1}
  maxSize={2}
  showPreview={true}
/>
```

### 3. SimpleUploadButton Component

A simpler upload button for basic file selection:

```tsx
import { SimpleUploadButton } from "@/components/ui/ImageUpload";

<SimpleUploadButton
  onUpload={(files) => console.log('Selected files:', files)}
>
  Choose Files
</SimpleUploadButton>
```

## Upload Endpoints

### 1. Avatar Uploader
- **Endpoint**: `avatarUploader`
- **Max File Size**: 2MB
- **Max Files**: 1
- **Access**: Authenticated users
- **Use Case**: User profile pictures

### 2. Product Image Uploader
- **Endpoint**: `productImageUploader`
- **Max File Size**: 4MB
- **Max Files**: 10
- **Access**: Admin users only
- **Use Case**: Product images in admin dashboard

### 3. General Image Uploader
- **Endpoint**: `generalImageUploader`
- **Max File Size**: 4MB
- **Max Files**: 5
- **Access**: Authenticated users
- **Use Case**: General content images

## Environment Configuration

Add the following to your `.env.local`:

```env
# UploadThing Configuration
UPLOADTHING_SECRET=sk_live_your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

**Note**: UploadThing automatically handles the URL configuration. You only need to provide the secret and app ID.

## Integration Examples

### 1. Profile Page Avatar Upload

```tsx
// In app/dashboard/profile/page.tsx
const [avatarUrl, setAvatarUrl] = useState<string>('');

const handleAvatarUpload = (urls: string[]) => {
  if (urls.length > 0) {
    setAvatarUrl(urls[0]);
    // Save to backend
  }
};

<ImageUpload
  endpoint="avatarUploader"
  onUpload={handleAvatarUpload}
  maxFiles={1}
  maxSize={2}
  showPreview={false}
/>
```

### 2. Admin Product Image Upload

```tsx
// In app/admin/products/page.tsx
const [images, setImages] = useState<{ url: string; isPrimary?: boolean }[]>([]);

<ImageUpload
  endpoint="productImageUploader"
  onUpload={(urls) => {
    const newImages = urls.map((url, index) => ({
      url,
      isPrimary: images.length === 0 && index === 0,
    }));
    setImages(prev => [...prev, ...newImages]);
  }}
  maxFiles={10}
  maxSize={4}
  showPreview={true}
/>
```

## Features

### Image Compression
- Uses `browser-image-compression` library
- Automatically compresses images before upload
- Maintains quality while reducing file size
- Configurable compression settings

### File Validation
- File type validation (JPEG, PNG, WebP)
- File size limits
- File count limits
- Client-side validation with user feedback

### Preview Functionality
- Grid layout for multiple images
- Hover effects for actions
- Remove individual images
- Set primary image (for product uploads)

### Security
- Role-based access control
- Authentication required for all uploads
- Admin-only access for product images
- Server-side validation

## Testing

Visit `/test-upload` to see a comprehensive example of all upload functionality.

## Dependencies

```json
{
  "uploadthing": "^6.0.0",
  "@uploadthing/react": "^6.0.0",
  "browser-image-compression": "^2.0.0"
}
```

## Best Practices

1. **Always validate files on both client and server**
2. **Use appropriate file size limits for different use cases**
3. **Implement proper error handling and user feedback**
4. **Consider image optimization for better performance**
5. **Use role-based access control for sensitive uploads**
6. **Provide clear upload progress indicators**

## Troubleshooting

### Common Issues

1. **Upload fails with "Unauthorized"**
   - Check if user is authenticated
   - Verify session is valid
   - Check role permissions for admin endpoints

2. **File size too large**
   - Check file size limits in endpoint configuration
   - Ensure image compression is working
   - Verify client-side validation

3. **Wrong file type**
   - Check accepted file types in component props
   - Verify file extension validation

4. **UploadThing configuration errors**
   - Verify environment variables are set correctly
   - Check UploadThing dashboard for API keys
   - Ensure proper endpoint configuration

## Future Enhancements

- [ ] Add image cropping functionality
- [ ] Implement drag and drop reordering
- [ ] Add bulk upload progress tracking
- [ ] Support for video uploads
- [ ] Integration with CDN for better performance
- [ ] Add image metadata extraction 
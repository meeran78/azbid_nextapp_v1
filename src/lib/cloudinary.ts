import { v2 as cloudinary } from "cloudinary";

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    "Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
  );
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: cloudName || "",
    api_key: apiKey || "",
    api_secret: apiSecret || "",
  });

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video" | "raw";
  format: string;
  bytes: number;
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Folder path in Cloudinary (e.g., "auctions/lots")
 * @param resourceType - "image", "video", or "auto"
 * @returns Upload result with URL and metadata
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = "auctions",
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<UploadResult> {
    // Validate configuration
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
    );
  }

  try {
    // Convert buffer to base64 if needed
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    let uploadResult;
    if (Buffer.isBuffer(file)) {
      // Upload from buffer using upload_stream
      uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload stream error:", error);
              reject(error);
            } else if (!result) {
              reject(new Error("Upload failed - no result returned"));
            } else {
              resolve(result);
            }
          }
        );

        // Handle stream errors
        uploadStream.on("error", (error) => {
          console.error("Upload stream error:", error);
          reject(error);
        });

        // Write buffer to stream
        uploadStream.end(file);
      });
    } else {
      // Upload from base64 string
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    }

    if (!uploadResult) {
      throw new Error("Upload failed - no result returned");
    }

    return {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      resource_type: uploadResult.resource_type as "image" | "video" | "raw",
      format: uploadResult.format || "",
      bytes: uploadResult.bytes || 0,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    const errorMessage =
      error.message || error.error?.message || "Failed to upload to Cloudinary";
    throw new Error(`Cloudinary upload failed: ${errorMessage}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @param resourceType - "image" or "video"
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<void> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Failed to delete: ${result.result}`);
    }
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
}

/**
 * Get optimized image URL with transformations
 * @param publicId - Public ID of the image
 * @param transformations - Cloudinary transformation options
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number | "auto";
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: string;
  }
): string {
  if (!cloudName) {
    throw new Error("Cloudinary is not configured");
  }

  const defaultTransformations = {
    quality: "auto" as const,
    format: "auto" as const,
    ...transformations,
  };

  return cloudinary.url(publicId, {
    ...defaultTransformations,
    secure: true,
  });
}

/**
 * Get video thumbnail URL
 * @param publicId - Public ID of the video
 * @returns Thumbnail URL
 */
export function getVideoThumbnailUrl(publicId: string): string {
  if (!cloudName) {
    throw new Error("Cloudinary is not configured");
  }

  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    secure: true,
  });
}
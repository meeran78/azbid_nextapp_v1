import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

// File size limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo", // AVI
  "video/x-ms-wmv", // WMV
];

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "auctions/lots";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine if it's an image or video
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and videos are allowed." },
        { status: 400 }
      );
    }

    // Validate file type
    if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (isVideo && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid video type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          error: `File size exceeds ${maxSizeMB}MB limit for ${isImage ? "images" : "videos"}`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      buffer,
      folder,
      isImage ? "image" : "video"
    );

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to upload file",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove files from Cloudinary
export async function DELETE(request: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("public_id");
    const resourceType = (searchParams.get("resource_type") as "image" | "video") || "image";

    if (!publicId) {
      return NextResponse.json(
        { error: "public_id is required" },
        { status: 400 }
      );
    }

    const { deleteFromCloudinary } = await import("@/lib/cloudinary");
    await deleteFromCloudinary(publicId, resourceType);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to delete file",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
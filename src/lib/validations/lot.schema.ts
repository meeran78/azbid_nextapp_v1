import { z } from "zod";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv"];

// Schema for client-side form (with File objects) - supports both images and videos
export const itemMediaSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) return false;
        
        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
        return file.size <= maxSize;
      },
      (file) => {
        const isImage = file.type.startsWith("image/");
        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
        const maxSizeMB = maxSize / (1024 * 1024);
        return `File size must be less than ${maxSizeMB}MB`;
      }
    )
    .refine(
      (file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (isImage) {
          return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }
        if (isVideo) {
          return ACCEPTED_VIDEO_TYPES.includes(file.type);
        }
        return false;
      },
      "Only images (JPEG, PNG, WEBP, GIF) and videos (MP4, WEBM, MOV, AVI, WMV) are allowed"
    ),
  preview: z.string().optional(),
  resource_type: z.enum(["image", "video"]).optional(),
});

// Schema for server action (with media URLs as strings)
export const itemSchemaForServer = z
  .object({
    title: z.string().min(1, "Item title is required").max(200, "Title must be less than 200 characters"),
    categoryId: z.string().min(1, "Category is required").optional().nullable(),
    condition: z.enum(["New", "Like New", "Used – Good", "Used – Fair", "Salvage"], {
      required_error: "Please select a condition",
    }),
    startPrice: z.coerce.number().min(0, "Starting price must be positive"),
    retailPrice: z.coerce.number().min(0, "Price must be positive").optional().nullable(),
    reservePrice: z.coerce.number().min(0, "Price must be positive").optional().nullable(),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    imageUrls: z.array(z.string()).optional().default([]),
    videoUrls: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      // Reserve price ≤ retail price (if both exist)
      if (data.reservePrice != null && data.retailPrice != null) {
        return data.reservePrice <= data.retailPrice;
      }
      return true;
    },
    {
      message: "Reserve price must be less than or equal to retail price",
      path: ["reservePrice"],
    }
  );

// Schema for client-side form (with File objects)
export const itemSchema = z
  .object({
    title: z.string().min(1, "Item title is required").max(200, "Title must be less than 200 characters"),
    categoryId: z.string().min(1, "Category is required").optional().nullable(),
    condition: z.enum(["New", "Like New", "Used – Good", "Used – Fair", "Salvage"], {
      required_error: "Please select a condition",
    }),
    startPrice: z.coerce.number().min(0, "Starting price must be positive"),
    retailPrice: z.coerce.number().min(0, "Price must be positive").optional().nullable(),
    reservePrice: z.coerce.number().min(0, "Price must be positive").optional().nullable(),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    images: z.array(itemMediaSchema).max(10, "Maximum 10 images per item").optional().default([]),
    videos: z.array(itemMediaSchema).max(5, "Maximum 5 videos per item").optional().default([]),
  })
  .refine(
    (data) => {
      // Reserve price ≤ retail price (if both exist)
      if (data.reservePrice != null && data.retailPrice != null) {
        return data.reservePrice <= data.retailPrice;
      }
      return true;
    },
    {
      message: "Reserve price must be less than or equal to retail price",
      path: ["reservePrice"],
    }
  );

export const createLotSchema = z
  .object({
    lotId: z.string().optional(),
    title: z.string().min(1, "Lot title is required").max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .min(500, "Description must be at least 500 characters")
      .max(2000, "Description must be less than 2000 characters"),
    storeId: z.string().min(1, "Store is required"),
    auctionId: z.string().optional().nullable(),
    lotDisplayId: z.string().optional().nullable(),
    closesAt: z.coerce.date({
      required_error: "Closing date and time is required",
    }),
    removalStartAt: z.coerce.date().optional().nullable(),
    inspectionAt: z.coerce.date().optional().nullable(),
    items: z.array(itemSchema).min(1, "At least one item is required"),
    disclaimerAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the disclaimer to proceed",
    }),
  })
  .refine(
    (data) => {
      // Closing Date > current time
      return data.closesAt > new Date();
    },
    {
      message: "Closing date must be in the future",
      path: ["closesAt"],
    }
  )
  .refine(
    (data) => {
      // Removal Start ≥ Closing Date
      if (data.removalStartAt && data.closesAt) {
        return data.removalStartAt >= data.closesAt;
      }
      return true;
    },
    {
      message: "Removal start date must be on or after closing date",
      path: ["removalStartAt"],
    }
  )
  .refine(
    (data) => {
      // Inspection Date ≤ Closing Date
      if (data.inspectionAt && data.closesAt) {
        return data.inspectionAt >= data.closesAt;
      }
      return true;
    },
    {
      message: "Inspection date must be on or after closing date",
      path: ["inspectionAt"],
    }
  );

// Schema for server action (with serialized dates and image URLs)
export const createLotSchemaForServer = z
  .object({
    lotId: z.string().optional(),
    title: z.string().min(1, "Lot title is required").max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .min(500, "Description must be at least 500 characters")
      .max(2000, "Description must be less than 2000 characters"),
    storeId: z.string().min(1, "Store is required"),
    auctionId: z.string().optional().nullable(),
    lotDisplayId: z.string().optional().nullable(),
    closesAt: z.string().transform((str) => new Date(str)),
    removalStartAt: z.string().optional().nullable().transform((str) => (str ? new Date(str) : null)),
    inspectionAt: z.string().optional().nullable().transform((str) => (str ? new Date(str) : null)),
    items: z.array(itemSchemaForServer).min(1, "At least one item is required"),
    disclaimerAccepted: z.boolean(),
  })
  .refine(
    (data) => {
      // Closing Date > current time
      return data.closesAt > new Date();
    },
    {
      message: "Closing date must be in the future",
      path: ["closesAt"],
    }
  )
  .refine(
    (data) => {
      // Removal Start ≥ Closing Date
      if (data.removalStartAt && data.closesAt) {
        return data.removalStartAt >= data.closesAt;
      }
      return true;
    },
    {
      message: "Removal start date must be on or after closing date",
      path: ["removalStartAt"],
    }
  )
  .refine(
    (data) => {
      // Inspection Date ≤ Closing Date
      if (data.inspectionAt && data.closesAt) {
        return data.inspectionAt >= data.closesAt;
      }
      return true;
    },
    {
      message: "Inspection date must be on or after closing date",
      path: ["inspectionAt"],
    }
  );

  // Draft schema with relaxed validation (for saving drafts)
export const draftLotSchemaForServer = z
.object({
  lotId: z.string().optional(),
  title: z.string().min(1, "Lot title is required").max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required") // Relaxed: no 500 char minimum
    .max(2000, "Description must be less than 2000 characters"),
  storeId: z.string().min(1, "Store is required"),
  auctionId: z.string().optional().nullable(),
  lotDisplayId: z.string().optional().nullable(),
  closesAt: z.string().transform((str) => new Date(str)),
  removalStartAt: z.string().optional().nullable().transform((str) => (str ? new Date(str) : null)),
  inspectionAt: z.string().optional().nullable().transform((str) => (str ? new Date(str) : null)),
  items: z.array(itemSchemaForServer).min(1, "At least one item is required"),
  disclaimerAccepted: z.boolean().optional(), // Optional for drafts
})
// No date validation refinements for drafts - allow any dates
// No disclaimer requirement for drafts

export type CreateLotFormData = z.infer<typeof createLotSchema>;
export type CreateLotServerData = z.infer<typeof createLotSchemaForServer>;
export type ItemFormData = z.infer<typeof itemSchema>;
export type DraftLotServerData = z.infer<typeof draftLotSchemaForServer>;
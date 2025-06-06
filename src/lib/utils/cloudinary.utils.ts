import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  sync: true,
});

export const validateCloudinaryConfig = (preset?: string) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  if (preset && !preset) {
    throw new Error("Cloudinary upload preset is required for this operation.");
  }
};

export const uploadToCloudinary = async (
  file: File,
  options: {
    folder?: string;
    publicId?: string;
    preset?: string;
    transformation?: unknown[];
  } = {},
): Promise<{
  secure_url: string;
  public_id: string;
  resource_type: string;
  bytes: number;
}> => {
  try {
    validateCloudinaryConfig(options.preset);

    if (!file || file.size === 0) {
      throw new Error("Invalid file provided.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        folder: options.folder || "chat-app",
        resource_type: "auto",
        ...options,
      };

      if (options.publicId) {
        uploadOptions.public_id = options.publicId;
      }

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error(`Upload failed: ${error.message}`));
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
              bytes: result.bytes,
            });
          } else {
            reject(new Error("Upload failed: No result returned"));
          }
        })
        .end(buffer);
    });
  } catch (error) {
    console.error("Upload preparation error:", error);
    throw error instanceof Error ? error : new Error("Failed to upload file");
  }
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
): Promise<{ success: boolean; message: string }> => {
  try {
    validateCloudinaryConfig();

    if (!publicId || typeof publicId !== "string") {
      throw new Error("Valid public ID is required for deletion.");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === "ok") {
      return { success: true, message: "File deleted successfully" };
    } else if (result.result === "not found") {
      return { success: false, message: "File not found in Cloudinary" };
    } else {
      return { success: false, message: `Deletion failed: ${result.result}` };
    }
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
};

export { cloudinary };

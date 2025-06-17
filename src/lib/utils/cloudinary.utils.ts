interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

const getCloudinaryConfig = (): CloudinaryConfig => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  return { cloudName, apiKey, apiSecret };
};

export const validateCloudinaryConfig = (preset?: string) => {
  getCloudinaryConfig();

  if (preset && !preset) {
    throw new Error("Cloudinary upload preset is required for this operation.");
  }
};

const generateSignature = async (
  params: Record<string, string | number>,
  apiSecret: string,
): Promise<string> => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  // Use Web Crypto API for edge runtime compatibility
  const encoder = new TextEncoder();
  const data = encoder.encode(sortedParams + apiSecret);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert to hex string
  return Array.from(hashArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
    const { cloudName } = getCloudinaryConfig();

    if (!file || file.size === 0) {
      throw new Error("Invalid file provided.");
    }

    // For unsigned upload, we need a preset
    if (!options.preset) {
      throw new Error("Upload preset is required for unsigned upload.");
    }

    const formData = new FormData();

    // Add the file
    formData.append("file", file);

    // Add the upload preset for unsigned upload
    formData.append("upload_preset", options.preset);

    // Add optional parameters
    if (options.folder) {
      formData.append("folder", options.folder);
    }

    if (options.publicId) {
      formData.append("public_id", options.publicId);
    }

    // Add transformation if provided
    if (options.transformation && Array.isArray(options.transformation)) {
      formData.append("transformation", JSON.stringify(options.transformation));
    }

    // Use unsigned upload endpoint for edge runtime compatibility
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Upload failed: ${errorData.error?.message || response.statusText}`,
      );
    }

    const result = await response.json();

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      bytes: result.bytes,
    };
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
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    if (!publicId || typeof publicId !== "string") {
      throw new Error("Valid public ID is required for deletion.");
    }

    // Generate timestamp for signature
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Prepare parameters for signature
    const signatureParams: Record<string, string | number> = {
      public_id: publicId,
      timestamp,
    };

    if (resourceType !== "auto") {
      signatureParams.resource_type = resourceType;
    } // Generate signature for authenticated deletion
    const signature = await generateSignature(signatureParams, apiSecret);

    // Prepare form data
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    if (resourceType !== "auto") {
      formData.append("resource_type", resourceType);
    }

    // Use destroy endpoint
    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType === "auto" ? "image" : resourceType}/destroy`;

    const response = await fetch(deleteUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Delete failed: ${errorData.error?.message || response.statusText}`,
      );
    }

    const result = await response.json();

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

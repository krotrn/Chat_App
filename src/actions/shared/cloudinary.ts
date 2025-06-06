"use server";

import {
  uploadToCloudinary as uploadUtil,
  deleteFromCloudinary as deleteUtil,
} from "@/lib/utils/cloudinary.utils";

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
  return uploadUtil(file, options);
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
): Promise<{ success: boolean; message: string }> => {
  return deleteUtil(publicId, resourceType);
};

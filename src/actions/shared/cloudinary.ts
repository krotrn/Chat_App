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
    transformation?: string[];
    resourceType?: "auto" | "image" | "video" | "raw";
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
): Promise<{ success: boolean; message: string }> => {
  return deleteUtil(publicId);
};

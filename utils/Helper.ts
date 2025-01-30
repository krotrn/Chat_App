import fs from "fs/promises";

export const removeLocalFile = async (localPath: string): Promise<void> => {
  try {
    // Check if file exists before attempting to remove it
    await fs.access(localPath);
    
    // Remove the file
    await fs.unlink(localPath);
    console.info("✅ Removed local file:", localPath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn("⚠️ File not found, skipping deletion:", localPath);
    } else {
      console.error("❌ Error while removing local file:", error);
    }
  }
};

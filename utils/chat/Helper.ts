import fs from "fs/promises";

export const removeLocalFile = async (localPath: string): Promise<void> => {
  try {
    await fs.access(localPath);
    
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

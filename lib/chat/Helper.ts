import fs from "fs/promises";

/**
 * Removes a local file if it exists.
 * @param localPath - The path to the file that needs to be deleted.
 */
export const removeLocalFile = async (localPath: string): Promise<void> => {
  try {
    await fs.unlink(localPath);
    console.info(`✅ Successfully removed file: ${localPath}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`⚠️ File not found, skipping deletion: ${localPath}`);
    } else {
      console.error(`❌ Error while removing file (${localPath}):`, error);
    }
  }
};

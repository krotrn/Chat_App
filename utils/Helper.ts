import fs from "fs";

export const removeLocalFile = (localPath:string) => {
  fs.unlink(localPath, (err) => {
    if (err) console.error("Error while removing local files: ", err);
    else {
      console.info("Removed local: ", localPath);
    }
  });
};
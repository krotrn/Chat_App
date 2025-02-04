import bcrypt from "bcrypt"
export const saltAndHashPassword = async (password: string) =>{
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword
}
import { z } from "zod";

export const userNameValidation = z.string().min(2, "username must be of atleast 2 characters").max(20, "username must not exceed 20 characters").regex(/^[a-zA-Z0-9._%+-]+$/, "username mustn't contain any special character")

export const signUpSchema = z.object({
    username: userNameValidation,
    email: z.string().email({ message: "invalid email address" }),
    password: z.string().min(6, { message: "password must be of minm 6 characters" })
})
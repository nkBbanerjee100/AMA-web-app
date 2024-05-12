import { z } from "zod";

export const msgSchema = z.object({
    content: z.string().min(10, "content must be of > 10 chrs").max(200, "content must not be >200 chars")
})
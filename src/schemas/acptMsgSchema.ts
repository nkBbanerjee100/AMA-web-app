import { z } from "zod";

export const acptMsgsSchema = z.object({
    acptMsgs: z.boolean()
})
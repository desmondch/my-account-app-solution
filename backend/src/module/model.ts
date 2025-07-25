
import z from 'zod'

export const VerifyCodeSchema = z.object({
    code: z.coerce.string().regex(/\d{6}/)
})

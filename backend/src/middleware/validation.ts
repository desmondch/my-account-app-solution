
import { type Request, type Response, type NextFunction } from 'express'
import z, { ZodError, type ZodObject } from 'zod'


export function validate(schemaQuery: ZodObject | null = null, schemaParam: ZodObject | null = null, schemaBody: ZodObject | null = null) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (schemaQuery) {
                schemaQuery.parse(req.query)
            }

            if (schemaParam) {
                schemaParam.parse(req.params)
            }

            if (schemaBody) {
                schemaBody.parse(req.body)
            }

            next()
        } catch(error) {
            if (error instanceof ZodError) {
                res.status(400).send({ error: z.prettifyError(error) })
            } else {
                res.sendStatus(500)
            }
        }
    }
}
import { z } from 'zod';

export const CreateThingSchema = z.object({
	name: z.string()
});

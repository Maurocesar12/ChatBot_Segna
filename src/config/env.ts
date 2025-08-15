// src/config/env.ts
import 'dotenv/config'; import { z } from 'zod';
export const ENV = z.object({
  OPENAI_API_KEY: z.string().min(10),
  AI_SELECTED: z.enum(['GPT','GEMINI']).default('GPT'),
  MONGO_URI: z.string().url(),
  CHROME_BIN: z.string().optional(),
  BOT_MAX_INPUT_CHARS: z.coerce.number().default(2000),
  BOT_CHUNK_MAX: z.coerce.number().default(1200),
  BOT_CHUNK_DELAY_MS: z.coerce.number().default(900),
  LOG_LEVEL: z.enum(['debug','info','warn','error']).default('info'),
}).parse(process.env);

import { z } from 'zod';

// Loose/passthrough on purpose: this is conversational history and previously-emitted
// actions being fed back into the system prompt as context, not something that gets
// executed - cadExecutor.ts re-validates action.type independently before creating
// anything. The caps below exist to bound request size/cost, not to model the full
// CadAction/feature-parameter shape.
const cadActionSchema = z.object({
  id: z.string(),
  type: z.string(),
  endpoint: z.string(),
  method: z.string(),
  body: z.record(z.any()).optional(),
  description: z.string(),
  status: z.string(),
}).passthrough();

const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(8000),
  actions: z.array(cadActionSchema).max(20).optional(),
}).passthrough();

const chatContextSchema = z.object({
  documentId: z.string().nullable(),
  partStudioId: z.string().nullable(),
  selectedFaceId: z.string().nullable(),
  selectedEdgeIds: z.array(z.string()).max(500),
  selectedVertexIds: z.array(z.string()).max(500),
  units: z.enum(['mm', 'inch', 'm']),
  modelDescription: z.string().max(500),
});

export const assistantRequestSchema = z.object({
  userMessage: z.string().min(1).max(4000),
  // buildMessageHistory (src/lib/assistant/openai.ts) only ever uses the last 10 anyway;
  // the cap here just bounds payload size before it gets that far.
  messages: z.array(chatMessageSchema).max(50),
  context: chatContextSchema,
  model: z.enum(['gpt-6-astra', 'gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna']).optional(),
}).strict();

export type AssistantRequestBody = z.infer<typeof assistantRequestSchema>;

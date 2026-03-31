import type { CreateProfessionalReplyInput } from "@archi-legal/domain/messaging";
import {
  createProfessionalReplySchema,
  type CreateProfessionalReplyInputSchema,
} from "@archi-legal/domain/zod/messaging";

export { createProfessionalReplySchema };
export type { CreateProfessionalReplyInputSchema };

// Compile-time guard to keep schema aligned with domain contract.
const _schemaContractCheck: CreateProfessionalReplyInput = {} as CreateProfessionalReplyInputSchema;
void _schemaContractCheck;

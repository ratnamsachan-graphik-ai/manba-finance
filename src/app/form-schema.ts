import { z } from "zod";

export const loanFormSchema = z.object({
  callee_name: z.string().min(1, { message: "Name is required." }),
  mobile_number: z.string().regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
});

export type LoanFormValues = z.infer<typeof loanFormSchema>;

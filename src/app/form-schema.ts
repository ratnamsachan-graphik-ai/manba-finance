import { z } from "zod";

export const loanFormSchema = z.object({
  callee_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile_number: z.string().regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
  loan_number: z.string().optional(),
  
  sanc_amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  total_disb_amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  pend_disb_amount: z.coerce.number().nonnegative({ message: "Pending amount cannot be negative." }),
  proce_fee_amount: z.coerce.number().positive({ message: "Fee must be a positive number." }),
  tot_ded_amount: z.coerce.number().nonnegative({ message: "Deduction cannot be negative." }),
  
  roi: z.coerce.number().positive({ message: "Rate of interest must be positive." }),
  loan_tenor: z.coerce.number().int().positive({ message: "Tenor must be a positive number of months." }),
  emi_amount: z.coerce.number().positive({ message: "EMI amount must be positive." }),
  
  loan_disb_date: z.string().min(1, { message: "Loan disbursed date is required." }),
  loan_start_date: z.string().min(1, { message: "Loan start date is required." }),
  emi_due_date: z.string().min(1, { message: "First EMI due date is required." }),
  loan_end_date: z.string().min(1, { message: "Loan end date is required." }),
  
  cheq_hand: z.string().optional(),
  payment_mode: z.string().min(1, { message: "Payment mode is required." }),

  terms_agreed: z.boolean().optional(),
});

export type LoanFormValues = z.infer<typeof loanFormSchema>;

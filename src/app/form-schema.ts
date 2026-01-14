import { z } from "zod";

export const loanFormSchema = z.object({
  callee_name: z.string().min(1, { message: "Name is required." }),
  mobile_number: z.string().regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
  loan_number: z.string().optional(),
  
  sanc_amount: z.coerce.number({invalid_type_error: "Sanctioned amount is required."}).positive({ message: "Amount must be a positive number." }),
  total_disb_amount: z.coerce.number({invalid_type_error: "Disbursed amount is required."}).positive({ message: "Amount must be a positive number." }),
  pend_disb_amount: z.coerce.number().nonnegative({ message: "Pending amount cannot be negative." }).optional(),
  proce_fee_amount: z.coerce.number({invalid_type_error: "Processing fee is required."}).nonnegative({ message: "Fee cannot be negative." }),
  tot_ded_amount: z.coerce.number({invalid_type_error: "Deduction amount is required."}).nonnegative({ message: "Deduction cannot be negative." }),
  
  roi: z.coerce.number({invalid_type_error: "Rate of interest is required."}).positive({ message: "Rate of interest must be positive." }),
  loan_tenor: z.coerce.number({invalid_type_error: "Loan tenor is required."}).int().positive({ message: "Tenor must be a positive number of months." }),
  emi_amount: z.coerce.number().nonnegative({ message: "EMI amount must be non-negative." }).optional(),
  
  loan_disb_date: z.string().min(1, { message: "Loan disbursed date is required." }),
  emi_due_date: z.string().min(1, { message: "First EMI due date is required." }),
  loan_end_date: z.string().min(1, { message: "Loan end date is required." }),
  
  cheq_hand: z.string().min(1, { message: "Cheque handover status is required." }),
  payment_mode: z.string().min(1, { message: "Payment mode is required." }),

  terms_agreed: z.boolean().optional(),
  loan_start_date: z.string().optional(), // No longer a user input, but passed to action
}).refine(data => {
  if (data.sanc_amount !== undefined && data.total_disb_amount !== undefined) {
    return data.total_disb_amount <= data.sanc_amount;
  }
  return true;
}, {
  message: "Disbursed amount cannot be greater than sanctioned amount.",
  path: ["total_disb_amount"],
}).refine(data => {
  if (data.sanc_amount !== undefined && data.tot_ded_amount !== undefined) {
    return data.tot_ded_amount <= data.sanc_amount;
  }
  return true;
}, {
  message: "Deduction amount cannot be greater than sanctioned amount.",
  path: ["tot_ded_amount"],
}).refine(data => {
    if (data.loan_disb_date && data.emi_due_date) {
        try {
            const disbDate = new Date(data.loan_disb_date);
            const emiDate = new Date(data.emi_due_date);
            return disbDate < emiDate;
        } catch (e) {
            return true; // Let individual date validation handle invalid formats
        }
    }
    return true;
}, {
    message: "Loan disbursed date must be before the first EMI due date.",
    path: ["loan_disb_date"],
});

export type LoanFormValues = z.infer<typeof loanFormSchema>;


"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loanFormSchema, type LoanFormValues } from "@/app/form-schema";
import { submitLoanForm } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const defaultValues: Partial<LoanFormValues> = {
  callee_name: "",
  mobile_number: "",
  loan_number: "",
  sanc_amount: 500000,
  total_disb_amount: 450000,
  pend_disb_amount: 50000,
  proce_fee_amount: 5000,
  tot_ded_amount: 1000,
  roi: 8.5,
  loan_tenor: 240,
  emi_amount: 4339,
  loan_disb_date: "2026-01-15",
  loan_start_date: "2026-02-01",
  emi_due_date: "2026-03-01",
  loan_end_date: "2046-02-01",
  cheq_hand: "",
  payment_mode: "",
  terms_agreed: false,
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-primary mb-4">{children}</h3>
);

export function LoanForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{success: boolean; message: string} | null>(null);

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues,
  });

  async function onSubmit(values: LoanFormValues) {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    const result = await submitLoanForm(values);
    setIsSubmitting(false);

    setSubmissionStatus(result);

    if (result.success) {
      form.reset();
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary font-headline">Request a Call</CardTitle>
        <CardDescription className="text-center">
          Please share your details to get an instant callback from our executive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <SectionTitle>Personal Details</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="callee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter your 10-digit number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="loan_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter loan number" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />

            <SectionTitle>Loan Amount Details</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="sanc_amount" render={({ field }) => (<FormItem><FormLabel>Sanctioned Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="total_disb_amount" render={({ field }) => (<FormItem><FormLabel>Total Disbursed Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="pend_disb_amount" render={({ field }) => (<FormItem><FormLabel>Pending Disbursed Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="proce_fee_amount" render={({ field }) => (<FormItem><FormLabel>Processing Fee Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="tot_ded_amount" render={({ field }) => (<FormItem><FormLabel>Total Deduction Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="roi" render={({ field }) => (<FormItem><FormLabel>Rate of Interest (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="loan_tenor" render={({ field }) => (<FormItem><FormLabel>Loan Tenor (months)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="emi_amount" render={({ field }) => (<FormItem><FormLabel>EMI Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <Separator className="my-6" />

            <SectionTitle>Dates & Deadlines</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <FormField control={form.control} name="loan_disb_date" render={({ field }) => (<FormItem><FormLabel>Loan Disbursed Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="loan_start_date" render={({ field }) => (<FormItem><FormLabel>Loan Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="emi_due_date" render={({ field }) => (<FormItem><FormLabel>First EMI Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="loan_end_date" render={({ field }) => (<FormItem><FormLabel>Loan End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <Separator className="my-6" />

            <SectionTitle>Other Details</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="cheq_hand" render={({ field }) => (<FormItem><FormLabel>Cheque Handover (Optional)</FormLabel><FormControl><Input placeholder="Details..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="payment_mode" render={({ field }) => (<FormItem><FormLabel>Payment Mode (Optional)</FormLabel><FormControl><Input placeholder="e.g., NACH, Post-dated cheques" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            {submissionStatus && (
              <Alert variant={submissionStatus.success ? "default" : "destructive"} className={submissionStatus.success ? "bg-green-100 border-green-400 text-green-700" : ""}>
                <AlertTitle>{submissionStatus.success ? "Success!" : "Error"}</AlertTitle>
                <AlertDescription>
                  {submissionStatus.message}
                </AlertDescription>
              </Alert>
            )}

            <CardFooter className="flex justify-center p-0 pt-8">
              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full max-w-xs bg-accent hover:bg-accent/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request a Call
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

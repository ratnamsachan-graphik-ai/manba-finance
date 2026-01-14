
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMonths } from "date-fns";
import { Loader2, Lock } from "lucide-react";
import { loanFormSchema, type LoanFormValues } from "@/app/form-schema";
import { submitLoanForm } from "@/app/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const defaultValues: Partial<LoanFormValues> = {
  callee_name: "",
  mobile_number: "",
  loan_number: undefined,
  sanc_amount: undefined,
  total_disb_amount: undefined,
  pend_disb_amount: 0,
  proce_fee_amount: undefined,
  tot_ded_amount: undefined,
  roi: undefined,
  loan_tenor: undefined,
  emi_amount: 0,
  loan_disb_date: "",
  emi_due_date: "",
  loan_end_date: "",
  cheq_hand: "",
  payment_mode: "",
  terms_agreed: false,
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[24px] font-headline text-primary section-title">{children}</h3>
);

export function LoanForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{success: boolean; message: string} | null>(null);
  const [isPayloadDialogOpen, setIsPayloadDialogOpen] = useState(false);
  const [payloadToShow, setPayloadToShow] = useState<string | null>(null);

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { watch, setValue, trigger } = form;
  const sancAmount = watch("sanc_amount");
  const totalDisbAmount = watch("total_disb_amount");
  const totDeductionAmount = watch("tot_ded_amount");
  const roi = watch("roi");
  const loanTenor = watch("loan_tenor");
  const loanDisbDate = watch("loan_disb_date");
  const emiDueDate = watch("emi_due_date");

  useEffect(() => {
    const sanctioned = Number(sancAmount) || 0;
    const disbursed = Number(totalDisbAmount) || 0;
    const pending = sanctioned - disbursed;
    setValue("pend_disb_amount", pending >= 0 ? pending : 0);
    if(sancAmount !== undefined && totalDisbAmount !== undefined) {
        trigger("total_disb_amount");
    }
  }, [sancAmount, totalDisbAmount, setValue, trigger]);

  useEffect(() => {
      if (sancAmount !== undefined && totDeductionAmount !== undefined) {
          trigger("tot_ded_amount");
      }
  }, [sancAmount, totDeductionAmount, trigger]);
  
  useEffect(() => {
    const principal = Number(totalDisbAmount) || 0;
    const rate = Number(roi) || 0;
    const tenor = Number(loanTenor) || 0;

    if (principal > 0 && rate > 0 && tenor > 0) {
      const monthlyRate = rate / 12 / 100;
      const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenor)) /
        (Math.pow(1 + monthlyRate, tenor) - 1);
      
      setValue("emi_amount", Math.round(emi));
    } else {
       setValue("emi_amount", 0);
    }
  }, [totalDisbAmount, roi, loanTenor, setValue]);

  useEffect(() => {
    if (loanDisbDate && emiDueDate) {
        trigger("loan_disb_date");
    }
    const firstEmiDate = emiDueDate;
    const tenor = Number(loanTenor) || 0;

    if (firstEmiDate && tenor > 0) {
      try {
        const start = new Date(firstEmiDate);
        // Correct for timezone offset to prevent date from shifting
        const zonedStart = new Date(start.valueOf() + start.getTimezoneOffset() * 60 * 1000);
        
        // As per new rule: loan_start_date = first_emi_due_date
        setValue("loan_start_date", format(zonedStart, "yyyy-MM-dd"));

        // As per new rule: loan_end_date = first_emi_due_date + (tenor - 1) months
        const endDate = addMonths(zonedStart, tenor - 1);
        setValue("loan_end_date", format(endDate, "yyyy-MM-dd"));

      } catch (e) {
        console.error("Invalid date for calculation", e)
        setValue("loan_start_date", "");
        setValue("loan_end_date", "");
      }
    } else {
        setValue("loan_start_date", "");
        setValue("loan_end_date", "");
    }
  }, [emiDueDate, loanTenor, setValue, loanDisbDate, trigger]);


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

  async function handleShowPayload() {
    const isValid = await form.trigger();
    if (!isValid) {
      setPayloadToShow("Form is invalid. Please fix the errors before viewing the payload.");
      setIsPayloadDialogOpen(true);
      return;
    }
    const values = form.getValues();
    const address_name = (values.callee_name || '').split(' ')[0];
    const payload = {
      mobile_number: values.mobile_number,
      campaign_type: "gold_loan",
      callee_name: values.callee_name,
      address_name: address_name,
      ...values,
    };
    // remove callee_name again as it's already in payload
    delete (payload as Partial<LoanFormValues>).callee_name;
    // reconstruct to have callee_name and address_name at the top for readability
     const finalPayload = {
      mobile_number: payload.mobile_number,
      campaign_type: payload.campaign_type,
      callee_name: values.callee_name,
      address_name: address_name,
      loan_number: payload.loan_number,
      sanc_amount: payload.sanc_amount,
      total_disb_amount: payload.total_disb_amount,
      pend_disb_amount: payload.pend_disb_amount,
      proce_fee_amount: payload.proce_fee_amount,
      tot_ded_amount: payload.tot_ded_amount,
      roi: payload.roi,
      loan_tenor: payload.loan_tenor,
      emi_amount: payload.emi_amount,
      loan_disb_date: payload.loan_disb_date,
      emi_due_date: payload.emi_due_date,
      loan_end_date: payload.loan_end_date,
      cheq_hand: payload.cheq_hand,
      payment_mode: payload.payment_mode,
      terms_agreed: payload.terms_agreed,
      loan_start_date: payload.loan_start_date,
    };

    setPayloadToShow(JSON.stringify(finalPayload, null, 2));
    setIsPayloadDialogOpen(true);
  }

  return (
    <>
      <Card className="w-full shadow-[0_10px_40px_rgba(51,48,69,0.08),0_2px_8px_rgba(51,48,69,0.04)] transition-all hover:shadow-[0_15px_50px_rgba(51,48,69,0.12),0_4px_10px_rgba(51,48,69,0.08)] hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="text-[44px] font-bold text-center font-headline text-accent">Request a Call</CardTitle>
          <CardDescription className="text-center">
            Please share your details to get an instant callback from our executive.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-6">
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
                          <FormLabel>Loan Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter loan number" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <SectionTitle>Loan Amount Details</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormField control={form.control} name="sanc_amount" render={({ field }) => (<FormItem><FormLabel>Sanctioned Amount</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="total_disb_amount" render={({ field }) => (<FormItem><FormLabel>Total Disbursed Amount</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="pend_disb_amount" render={({ field }) => (<FormItem><FormLabel>Pending Disbursed Amount</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-gray-100" value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="proce_fee_amount" render={({ field }) => (<FormItem><FormLabel>Processing Fee Amount</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="tot_ded_amount" render={({ field }) => (<FormItem><FormLabel>Total Deduction Amount</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField
                        control={form.control}
                        name="roi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate of Interest (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="loan_tenor" render={({ field }) => (<FormItem><FormLabel>Loan Tenor (months)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="emi_amount" render={({ field }) => (<FormItem><FormLabel>EMI Amount</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-gray-100" value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>

                <div className="space-y-6">
                  <SectionTitle>Dates & Deadlines</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      <FormField control={form.control} name="loan_disb_date" render={({ field }) => (<FormItem><FormLabel>Loan Disbursed Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="emi_due_date" render={({ field }) => (<FormItem><FormLabel>First EMI Due Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="loan_end_date" render={({ field }) => (<FormItem><FormLabel>Loan End Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} readOnly className="bg-gray-100" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>

                <div className="space-y-6">
                  <SectionTitle>Other Details</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cheq_hand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cheque Handover</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Recieved">Recieved</SelectItem>
                              <SelectItem value="Non Recieved">Non Recieved</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payment_mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Mode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a payment mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NACH">NACH</SelectItem>
                              <SelectItem value="ECS">ECS</SelectItem>
                              <SelectItem value="PDC">PDC</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {submissionStatus && (
                  <Alert 
                    variant={submissionStatus.success ? "default" : "destructive"} 
                    className={`
                      ${submissionStatus.success ? "bg-green-100 border-green-400 text-green-700" : ""}
                      data-[state=open]:animate-in data-[state=closed]:animate-out 
                      data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
                      data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
                      data-[side=bottom]:slide-in-from-top-[100%] data-[side=top]:slide-out-to-top-[100%]
                    `}
                    data-state={submissionStatus ? "open" : "closed"}
                    >
                    <AlertTitle>{submissionStatus.success ? "Success!" : "Error"}</AlertTitle>
                    <AlertDescription>
                      {submissionStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                <CardFooter className="flex flex-col items-center justify-center p-0 pt-6 gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm">
                    <Button type="submit" disabled={isSubmitting} size="lg" className="w-full gradient-button text-white">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Request a Call
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleShowPayload}>
                      Show Payload
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Lock className="h-3 w-3" />
                    <span>Your information is secure</span>
                  </div>
                </CardFooter>
              </form>
            </Form>
        </CardContent>
      </Card>
      <AlertDialog open={isPayloadDialogOpen} onOpenChange={setIsPayloadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API Payload</AlertDialogTitle>
            <AlertDialogDescription>
              This is the JSON data that would be sent to the API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto rounded bg-gray-100 p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all">
              <code>{payloadToShow}</code>
            </pre>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

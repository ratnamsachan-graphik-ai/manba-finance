
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const defaultValues: Partial<LoanFormValues> = {
  callee_name: "",
  mobile_number: "",
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[24px] font-semibold text-foreground section-title">{children}</h3>
);

export function LoanForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{success: boolean; message: string} | null>(null);

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues,
    mode: "onChange",
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
    <>
      <Card className="w-full shadow-[0_10px_40px_rgba(51,48,69,0.08),0_2px_8px_rgba(51,48,69,0.04)] transition-all hover:shadow-[0_15px_50px_rgba(51,48,69,0.12),0_4px_10px_rgba(51,48,69,0.08)] hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="text-[42px] font-bold text-center text-primary">Request a Call</CardTitle>
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
    </>
  );
}

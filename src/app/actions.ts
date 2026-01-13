
"use server";

import type { LoanFormValues } from "./form-schema";

export async function submitLoanForm(data: LoanFormValues) {
  try {
    // Prepare the payload for the Ringg API
    const ringgPayload = {
      mobile_number: data.mobile_number,
      campaign_type: "gold_loan", // Default campaign type
      callee_name: data.callee_name,
      // Add all other form fields to custom_args_values
      loan_number: data.loan_number,
      sanc_amount: data.sanc_amount,
      total_disb_amount: data.total_disb_amount,
      pend_disb_amount: data.pend_disb_amount,
      proce_fee_amount: data.proce_fee_amount,
      tot_ded_amount: data.tot_ded_amount,
      roi: data.roi,
      loan_tenor: data.loan_tenor,
      emi_amount: data.emi_amount,
      loan_disb_date: data.loan_disb_date,
      loan_start_date: data.loan_start_date,
      emi_due_date: data.emi_due_date,
      loan_end_date: data.loan_end_date,
      cheq_hand: data.cheq_hand,
      payment_mode: data.payment_mode,
    };

    // Call the Ringg API endpoint
    // In server actions, we need to use absolute URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ringgPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Call API submission failed:", result);
      throw new Error(result.error || `Call API failed with status: ${response.status}`);
    }

    return {
      success: true,
      message: result.message || "Call initiated successfully! You should receive a call shortly.",
      data: result.data
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `An error occurred while initiating the call. ${errorMessage}` };
  }
}

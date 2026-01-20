
"use server";

import type { LoanFormValues } from "./form-schema";
import { nameTransliterationService } from "@/lib/name-transliteration";

function getAgentId(campaignType: string = "gold_loan"): string {
  // This logic is kept for future extensibility, e.g., for a 'winback' campaign
  if (campaignType === "winback") {
    return process.env.NEXT_CALL_AGENT_ID_WINBACK || "";
  }
  return process.env.NEXT_CALL_AGENT_ID || "";
}

export async function submitLoanForm(data: LoanFormValues) {
  try {
    const { mobile_number, callee_name, ...loanFields } = data;
    const campaign_type = "gold_loan"; // Hardcoded for this form

    // --- Validation ---
    if (!mobile_number) {
      return { success: false, message: "Mobile number is required." };
    }
    if (!callee_name) {
      return { success: false, message: "Callee name is required." };
    }

    const cleanNumber = mobile_number.replace(/[^0-9]/g, "");
    if (cleanNumber.length < 10) {
      return { success: false, message: "Invalid mobile number format." };
    }

    let formattedNumber = mobile_number.trim();
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = `+91${cleanNumber}`;
    }

    // --- Agent and API Config ---
    const agentId = getAgentId(campaign_type);
    const apiUrl = process.env.NEXT_PUBLIC_CALL_API_URL || "";
    const apiKey = process.env.NEXT_CALL_API_KEY || "";

    if (!agentId || !apiUrl || !apiKey) {
      const missing = [!agentId && "Agent ID", !apiUrl && "API URL", !apiKey && "API Key"].filter(Boolean).join(", ");
      console.error(`[Action] Server configuration error. Missing: ${missing}`);
      return {
        success: false,
        message: "Server configuration is incomplete. Please contact support.",
      };
    }

    // --- Transliteration ---
    let calleeNameHindi = callee_name;
    let addressNameHindi = callee_name.split(' ')[0];

    try {
      const translation = await nameTransliterationService.translateCustomerName(callee_name);
      calleeNameHindi = translation.customerNameHindi;
      addressNameHindi = translation.addressNameHindi;
      console.log(`[Action] Name translation successful for: ${callee_name}`);
    } catch (error) {
      console.error("[Action] Translation failed, using original values:", error);
    }
    
    // --- API Payload ---
    const custom_args_values = {
      ...loanFields,
      callee_name: calleeNameHindi,
      callee_name_hindi: calleeNameHindi,
      address_name: addressNameHindi,
      mobile_number: formattedNumber,
      current_date_time: new Date().toISOString(),
      max_rpg_our: 8787,
    };

    const payload = {
      name: callee_name,
      mobile_number: formattedNumber,
      agent_id: agentId,
      from_number: process.env.NEXT_CALL_FROM_NUMBER || "",
      custom_args_values,
      call_config: {
        idle_timeout_warning: 100,
        idle_timeout_end: 100,
        max_call_length: 3000,
        call_retry_config: {
          retry_count: 0,
          retry_busy: 30,
          retry_not_picked: 30,
          retry_failed: 30,
        },
        call_time: {
          call_start_time: "00:00",
          call_end_time: "23:59",
          timezone: "Asia/Kolkata",
        },
      },
    };

    // --- External API Call ---
    const fullApiUrl = `${apiUrl}/ca/api/v0/calling/outbound/individual`;
    const response = await fetch(fullApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorDetail = result.error || JSON.stringify(result);
      console.error(`External Call API Error (${response.status}):`, errorDetail);
      return { success: false, message: `Call service failed: ${errorDetail}` };
    }

    return {
      success: true,
      message: result.message || "Call initiated successfully! You should receive a call shortly.",
      data: result,
    };

  } catch (error) {
    console.error("Fatal error in submitLoanForm:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    if (errorMessage.includes("fetch failed")) {
        return { success: false, message: "Error: Could not connect to the call service. Please verify the `NEXT_PUBLIC_CALL_API_URL` environment variable is correct and the service is reachable." };
    }
    return { success: false, message: `An error occurred while initiating the call. ${errorMessage}` };
  }
}

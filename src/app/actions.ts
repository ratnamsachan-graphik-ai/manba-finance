
"use server";

import { nameTransliterationService } from "@/lib/name-transliteration";
import type { LoanFormValues } from "./form-schema";

const WEBHOOK_URL = "https://n8n.graphik.ai/webhook/e68eec1d-ce49-4c99-89e1-5913bab9b99d";

export async function submitLoanForm(data: LoanFormValues) {
  try {
    let translatedName = '';
    // Only attempt translation if a name is provided
    if (data.callee_name && data.callee_name.trim() !== '') {
      try {
        translatedName = await nameTransliterationService.translateText(data.callee_name);
      } catch (aiError) {
        console.error("AI translation failed:", aiError);
        // Fallback to original name if translation fails
        translatedName = data.callee_name;
      }
    }

    const payload = {
      ...data,
      callee_name_hindi: translatedName,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Webhook submission failed:", response.status, errorBody);
      throw new Error(`Webhook submission failed with status: ${response.status}`);
    }

    return { 
      success: true, 
      message: "Form submitted successfully! We will get back to you shortly.",
      data: payload 
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `An error occurred while submitting the form. ${errorMessage}` };
  }
}

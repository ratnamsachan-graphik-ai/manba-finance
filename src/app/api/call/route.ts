import { NextRequest, NextResponse } from "next/server";
import { nameTransliterationService } from "@/lib/name-transliteration";

function getAgentId(campaignType: string = "gold_loan"): string {
  if (campaignType === "winback") {
    return process.env.NEXT_CALL_AGENT_ID_WINBACK || "";
  }
  return process.env.NEXT_CALL_AGENT_ID || "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mobile_number,
      campaign_type = "gold_loan",
      callee_name,
    } = body;

    // Validate required fields
    if (!mobile_number) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }
    if (!callee_name) {
      return NextResponse.json(
        { error: "Callee name is required" },
        { status: 400 }
      );
    }

    // Validate mobile number format
    const cleanNumber = mobile_number.replace(/[^0-9]/g, "");
    if (cleanNumber.length < 10) {
      return NextResponse.json(
        { error: "Invalid mobile number format" },
        { status: 400 }
      );
    }

    // Format the mobile number with country code
    let formattedNumber = mobile_number.trim();
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = `+91${cleanNumber}`;
    }

    // Get agent ID based on campaign type
    const agentId = getAgentId(campaign_type);

    // Validate that agent_id is available
    if (!agentId) {
      return NextResponse.json(
        {
          error: "Missing agent_id. Please check your environment variables.",
        },
        { status: 500 }
      );
    }

    // Translate names to Hindi
    let calleeNameHindi = callee_name;
    let addressNameHindi = callee_name.split(' ')[0]; // Default to first name

    try {
        const translation =
          await nameTransliterationService.translateCustomerName(callee_name);

        calleeNameHindi = translation.customerNameHindi;
        addressNameHindi = translation.addressNameHindi;

        console.log("[API] Name translations:", {
          calleeName: `${callee_name} → ${calleeNameHindi}`,
          addressName: `First name → ${addressNameHindi}`,
          processingTime: `${translation.processingTime}ms`,
        });
    } catch (error) {
      console.error(
        "[API] Translation failed, using original values:",
        error
      );
      // Fallback to original values if translation fails
      calleeNameHindi = callee_name;
      addressNameHindi = callee_name.split(' ')[0];
    }
    

    // Prepare payload for outbound calling API
    const payload: any = {
      name: callee_name,
      mobile_number: formattedNumber,
      agent_id: agentId,
      from_number: process.env.NEXT_CALL_FROM_NUMBER || "",
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

    // Add custom_args_values with all form fields and Hindi translations
    const custom_args_values: any = {
      // Always include Hindi translated name if available
      callee_name: calleeNameHindi || callee_name,
      callee_name_hindi: calleeNameHindi || "",
      address_name: addressNameHindi || callee_name.split(' ')[0],
      mobile_number: formattedNumber,
      current_date_time: new Date().toISOString(),
      max_rpg_our: 8787,
    };

    payload.custom_args_values = custom_args_values;

    // Make request to outbound calling API
    const apiUrl = process.env.NEXT_PUBLIC_CALL_API_URL || "";
    const apiKey = process.env.NEXT_CALL_API_KEY || "";

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: "API configuration missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${apiUrl}/ca/api/v0/calling/outbound/individual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Call API Error:", errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message:
        "Call initiated successfully! You should receive a call shortly.",
      data: result,
    });
  } catch (error) {
    console.error("Call API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to initiate call",
      },
      { status: 500 }
    );
  }
}

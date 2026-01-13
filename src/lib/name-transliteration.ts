/**
 * Name Transliteration Service for Next.js
 * Transliterates English names to Hindi (Devanagari script) using Google's Gemini AI
 */

interface ParsedName {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
}

interface TransliterationResult {
  customerNameHindi: string;
  addressNameHindi: string;
  processingTime: number;
}

interface WinbackTransliterationResult {
  customerNameHindi: string;
  addressNameHindi: string;
  branchNameHindi: string;
  processingTime: number;
}

class NameTransliterationService {
  private readonly GEMINI_API_KEY: string;
  private readonly GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  constructor() {
    this.GEMINI_API_KEY = process.env.NEXT_GEMINI_API_KEY || "";
    if (!this.GEMINI_API_KEY) {
        console.warn("[NameTransliteration] Service initialized without API key. Translations will be skipped.");
    }
  }

  /**
   * Parse full name into components
   */
  private parseFullName(fullName: string): ParsedName {
    if (!fullName || typeof fullName !== "string") {
      return {
        firstName: "",
        middleName: "",
        lastName: "",
        fullName: "",
      };
    }

    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);

    if (parts.length === 0) {
      return {
        firstName: "",
        middleName: "",
        lastName: "",
        fullName: "",
      };
    }

    if (parts.length === 1) {
      return {
        firstName: parts[0],
        middleName: "",
        lastName: "",
        fullName: parts[0],
      };
    }

    if (parts.length === 2) {
      return {
        firstName: parts[0],
        middleName: "",
        lastName: parts[1],
        fullName: trimmed,
      };
    }

    // Three or more parts: First Middle(s) Last
    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(" "),
      lastName: parts[parts.length - 1],
      fullName: trimmed,
    };
  }

  /**
   * Batch transliterate multiple texts using Gemini AI
   */
  private async batchTransliterateWithAI(
    texts: string[]
  ): Promise<Record<string, string>> {
    if (!this.GEMINI_API_KEY) {
      console.warn(
        "[NameTransliteration] No Gemini API key, using original texts"
      );
      const fallback: Record<string, string> = {};
      texts.forEach((text) => {
        fallback[text] = text;
      });
      return fallback;
    }

    try {
      const textsList = texts
        .map((text, index) => `${index + 1}. ${text}`)
        .join("\n");

      const prompt = `Transliterate the following names/text from English to Hindi (Devanagari script).

IMPORTANT INSTRUCTIONS:
1. Transliterate the COMPLETE name/text provided - do not skip any parts
2. If a name has multiple parts (first, middle, last), transliterate ALL parts
3. If the same word appears twice (like "Ravi Ravi"), only transliterate once as "रवि"
4. Return each transliteration on a separate line in the same order
5. Do not include numbers or any other text
6. Only return the Hindi (Devanagari) transliteration

Examples:
- "Rahul Sharma" → "राहुल शर्मा" (both parts)
- "Rahul Dua" → "राहुल दुआ" (both parts)
- "M.S. Dhoni" → "एम.एस. धोनी" (all parts)
- "Ravi Ravi" → "रवि" (duplicate removed)
- "SK Finance" → "एस.के. फाइनेंस" (both words)

Names/Text to transliterate:
${textsList}`;

      const response = await fetch(
        `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const transliterations = text
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      const results: Record<string, string> = {};
      texts.forEach((originalText, index) => {
        const transliterated = transliterations[index] || originalText;

        // Validate that AI actually translated
        if (transliterated.toLowerCase() === originalText.toLowerCase()) {
          console.warn(
            `[NameTransliteration] AI may have failed for "${originalText}"`
          );
        }

        results[originalText] = transliterated;
      });

      console.log(
        `[NameTransliteration] Batch AI: ${texts.length} texts processed`
      );
      return results;
    } catch (error) {
      console.error("[NameTransliteration] Batch AI failed:", error);
      const fallback: Record<string, string> = {};
      texts.forEach((text) => {
        fallback[text] = text;
      });
      return fallback;
    }
  }

  /**
   * Translate a single text to Hindi
   * Useful for translating branch names or other single pieces of text
   */
  async translateText(text: string): Promise<string> {
    if (!text || typeof text !== "string" || !text.trim()) {
      return "";
    }

    try {
      const result = await this.batchTransliterateWithAI([text]);
      return result[text] || text;
    } catch (error) {
      console.error("[NameTransliteration] Error translating text:", error);
      return text;
    }
  }

  /**
   * Translate customer name and branch for Winback campaign
   * Returns Hindi translation for full name, first name, and branch name in a single batch
   */
  async translateWinbackData(
    customerName: string,
    branchName: string
  ): Promise<WinbackTransliterationResult> {
    const startTime = Date.now();

    try {
      // Parse customer name to extract first name
      const customerParsed = this.parseFullName(customerName);

      // Prepare translation - batch all three items together
      const textsToTranslate: string[] = [];
      const textMapping: Record<string, string> = {};

      // 1. Full customer name
      if (customerName) {
        textsToTranslate.push(customerName);
        textMapping["customerName"] = customerName;
      }

      // 2. First name only (for addressing)
      if (customerParsed.firstName) {
        textsToTranslate.push(customerParsed.firstName);
        textMapping["firstName"] = customerParsed.firstName;
      }

      // 3. Branch name
      if (branchName) {
        textsToTranslate.push(branchName);
        textMapping["branchName"] = branchName;
      }

      // Translate all three in a single batch API call
      const batchResults = await this.batchTransliterateWithAI(
        textsToTranslate
      );

      // Extract results
      const customerNameHindi =
        batchResults[textMapping["customerName"]] || customerName;
      const addressNameHindi =
        batchResults[textMapping["firstName"]] || customerParsed.firstName;
      const branchNameHindi =
        batchResults[textMapping["branchName"]] || branchName;

      const totalProcessingTime = Date.now() - startTime;

      console.log("[NameTransliteration] Winback translation complete:", {
        customerName: `${customerName} → ${customerNameHindi}`,
        addressName: `${customerParsed.firstName} → ${addressNameHindi}`,
        branchName: `${branchName} → ${branchNameHindi}`,
        processingTime: `${totalProcessingTime}ms`,
      });

      return {
        customerNameHindi,
        addressNameHindi,
        branchNameHindi,
        processingTime: totalProcessingTime,
      };
    } catch (error) {
      console.error(
        "[NameTransliteration] Error in Winback translation:",
        error
      );

      // Return fallback values (original names)
      const customerParsed = this.parseFullName(customerName);

      return {
        customerNameHindi: customerName,
        addressNameHindi: customerParsed.firstName || "Customer",
        branchNameHindi: branchName,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Main method: Translate customer name to Hindi
   * Returns Hindi translation for customer name and first name (address name)
   */
  async translateCustomerName(
    customerName: string
  ): Promise<TransliterationResult> {
    const startTime = Date.now();

    try {
      // Parse customer name to extract first name
      const customerParsed = this.parseFullName(customerName);

      // Prepare translation
      const textsToTranslate: string[] = [];
      const textMapping: Record<string, string> = {};

      // 1. Full customer name
      if (customerName) {
        textsToTranslate.push(customerName);
        textMapping["customerName"] = customerName;
      }

      // 2. First name only (for addressing)
      if (customerParsed.firstName) {
        textsToTranslate.push(customerParsed.firstName);
        textMapping["firstName"] = customerParsed.firstName;
      }

      // Translate both customer name and first name
      const batchResults = await this.batchTransliterateWithAI(
        textsToTranslate
      );

      // Extract results
      const customerNameHindi =
        batchResults[textMapping["customerName"]] || customerName;
      const addressNameHindi =
        batchResults[textMapping["firstName"]] || customerParsed.firstName;

      const totalProcessingTime = Date.now() - startTime;

      console.log("[NameTransliteration] Translation complete:", {
        customerName: `${customerName} → ${customerNameHindi}`,
        addressName: `${customerParsed.firstName} → ${addressNameHindi}`,
        processingTime: `${totalProcessingTime}ms`,
      });

      return {
        customerNameHindi,
        addressNameHindi,
        processingTime: totalProcessingTime,
      };
    } catch (error) {
      console.error("[NameTransliteration] Error in translation:", error);

      // Return fallback values (original names)
      const customerParsed = this.parseFullName(customerName);

      return {
        customerNameHindi: customerName,
        addressNameHindi: customerParsed.firstName || "Customer",
        processingTime: Date.now() - startTime,
      };
    }
  }
}

// Export singleton instance
export const nameTransliterationService = new NameTransliterationService();

    

import { SolarInputData } from "../types";

/**
 * Communicates with the WordPress REST API.
 */
export const saveLeadToWordPress = async (data: SolarInputData): Promise<{success: boolean, url: string, error?: string}> => {
  // 1. Resolve the Base URL
  // @ts-ignore
  const envWpUrl = import.meta.env?.VITE_WP_URL;
  // @ts-ignore
  const processWpUrl = typeof process !== 'undefined' ? (process.env?.VITE_WP_URL || process.env?.process?.env?.VITE_WP_URL) : undefined;
  
  const rawWpUrl = envWpUrl || processWpUrl || '';
  
  if (!rawWpUrl) {
    return { 
      success: false, 
      url: 'NOT_FOUND', 
      error: "VITE_WP_URL is missing. Please add it to Vercel and REDEPLOY your project." 
    };
  }

  // 2. Clean up the URL
  let baseUrl = rawWpUrl.trim().replace(/\/+$/, "");
  if (!baseUrl.toLowerCase().includes('/wp-json')) {
    baseUrl = `${baseUrl}/wp-json`;
  }
  
  const endpoint = `${baseUrl}/solar-ai/v1/save-lead`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, url: endpoint, error: `Server responded with ${response.status}: ${text.substring(0, 50)}` };
    }

    const result = await response.json();
    return { success: !!(result && (result.success || result.id)), url: endpoint };
  } catch (error: any) {
    return { success: false, url: endpoint, error: error.message || "Network connection refused." };
  }
};

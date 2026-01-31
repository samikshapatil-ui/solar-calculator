
import { SolarInputData } from "../types";

/**
 * Communicates with the WordPress REST API.
 * Uses VITE_WP_URL from Vercel environment variables.
 */
export const saveLeadToWordPress = async (data: SolarInputData): Promise<boolean> => {
  // 1. Resolve the Base URL from Vite or Process env
  // @ts-ignore - Vite env
  const envWpUrl = import.meta.env?.VITE_WP_URL;
  // @ts-ignore - Process env fallback
  const processWpUrl = typeof process !== 'undefined' ? process.env?.VITE_WP_URL : undefined;
  
  const rawWpUrl = envWpUrl || processWpUrl || '';
  
  if (!rawWpUrl) {
    console.error("CONFIG ERROR: VITE_WP_URL is empty. Did you redeploy after adding the env var in Vercel?");
    return false;
  }

  // 2. Clean up the URL
  // Remove trailing slashes and then check if /wp-json is already present
  let baseUrl = rawWpUrl.trim().replace(/\/+$/, "");
  
  if (!baseUrl.toLowerCase().includes('/wp-json')) {
    baseUrl = `${baseUrl}/wp-json`;
  }
  
  // 3. Final Endpoint construction
  const endpoint = `${baseUrl}/solar-ai/v1/save-lead`;
  
  console.log(">>> ATTEMPTING POST TO:", endpoint);

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
      const errorText = await response.text();
      console.error(`SERVER REJECTED (${response.status}):`, errorText);
      return false;
    }

    const result = await response.json();
    console.log(">>> SERVER SUCCESS:", result);
    return !!(result && (result.success || result.id));
  } catch (error: any) {
    console.error(">>> FETCH FAILED (Network/CORS):", error);
    return false;
  }
};

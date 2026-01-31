
import { SolarInputData } from "../types";

/**
 * Communicates with the WordPress REST API.
 * Uses VITE_WP_URL for Vercel deployments.
 */
export const saveLeadToWordPress = async (data: SolarInputData): Promise<boolean> => {
  // 1. Get WP URL from Vercel env or Embedded settings
  const externalWpUrl = (import.meta as any).env.VITE_WP_URL;
  const wpSettings = (window as any).wpApiSettings;
  
  let rootUrl = '';
  let nonce = '';

  if (externalWpUrl) {
    rootUrl = externalWpUrl.endsWith('/') ? externalWpUrl : `${externalWpUrl}/`;
  } else if (wpSettings) {
    rootUrl = wpSettings.root || '/wp-json/';
    nonce = wpSettings.nonce || '';
  } else {
    // Local development fallback
    console.log("Dev Mode: Lead would be saved to:", data);
    return true; 
  }

  try {
    const endpoint = `${rootUrl}solar-ai/v1/save-lead`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error("Lead storage failed:", error);
    return false;
  }
};

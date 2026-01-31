
import { SolarInputData } from "../types";

/**
 * Communicates with the WordPress REST API.
 * Prioritizes VITE_WP_URL from environment variables.
 */
export const saveLeadToWordPress = async (data: SolarInputData): Promise<boolean> => {
  // Check multiple possible sources for the WP URL (Vite standard and Process define)
  const externalWpUrl = 
    (import.meta as any).env?.VITE_WP_URL || 
    (process.env as any).VITE_WP_URL ||
    '';
    
  const wpSettings = (window as any).wpApiSettings;
  
  let rootUrl = '';
  let nonce = '';

  if (externalWpUrl) {
    // If using external URL (like on Vercel)
    rootUrl = externalWpUrl.endsWith('/') ? externalWpUrl : `${externalWpUrl}/`;
  } else if (wpSettings) {
    // If embedded directly inside WordPress
    rootUrl = wpSettings.root || '/wp-json/';
    nonce = wpSettings.nonce || '';
  } else {
    // Local development fallback
    console.warn("No WordPress URL found. Running in Dev Mode.");
    console.log("Payload:", data);
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

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("WP API Error:", errData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Network error saving lead:", error);
    return false;
  }
};

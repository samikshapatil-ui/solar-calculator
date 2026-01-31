
import { SolarInputData } from "../types";

/**
 * Communicates with the WordPress REST API.
 * Prioritizes the environment variable VITE_WP_URL set in Vercel.
 */
export const saveLeadToWordPress = async (data: SolarInputData): Promise<boolean> => {
  // Check multiple sources for the WordPress URL
  const externalWpUrl = 
    (import.meta as any).env?.VITE_WP_URL || 
    (process.env as any).VITE_WP_URL || 
    '';
    
  const wpSettings = (window as any).wpApiSettings;
  
  let rootUrl = '';
  let nonce = '';

  if (externalWpUrl && externalWpUrl.trim() !== '') {
    // Standardize URL: ensure it ends with /wp-json/
    let base = externalWpUrl.trim();
    if (!base.includes('/wp-json')) {
      base = base.endsWith('/') ? `${base}wp-json/` : `${base}/wp-json/`;
    } else {
      base = base.endsWith('/') ? base : `${base}/`;
    }
    rootUrl = base;
  } else if (wpSettings && wpSettings.root) {
    // Fallback for embedded mode
    rootUrl = wpSettings.root;
    nonce = wpSettings.nonce || '';
  } else {
    // Local dev fallback
    console.warn("No WordPress URL configured. Leads will not be saved.");
    console.log("Lead Data Payload:", data);
    return true; 
  }

  try {
    const endpoint = `${rootUrl}solar-ai/v1/save-lead`;
    console.debug("Attempting to save lead to:", endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WordPress API rejected the lead:", errorText);
      return false;
    }

    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error("Network error connecting to WordPress:", error);
    return false;
  }
};

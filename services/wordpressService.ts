
import { SolarInputData } from "../types";

/**
 * Communicates with the WordPress REST API at Vidyut Nation.
 */
export const saveLeadToWordPress = async (data: SolarInputData): Promise<{success: boolean, url: string, error?: string}> => {
  // 1. Resolve the Base URL
  // @ts-ignore
  const envWpUrl = import.meta.env?.VITE_WP_URL || process.env?.VITE_WP_URL;
  
  if (!envWpUrl) {
    return { 
      success: false, 
      url: 'MISSING', 
      error: "VITE_WP_URL is not set in Vercel settings." 
    };
  }

  // 2. Format URL correctly
  let baseUrl = envWpUrl.trim().replace(/\/+$/, "");
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
      return { 
        success: false, 
        url: endpoint, 
        error: `Server error (${response.status}). Ensure the 'Solar AI Advisor' plugin is active on WordPress.` 
      };
    }

    const result = await response.json();
    return { success: !!(result && (result.success || result.id)), url: endpoint };
  } catch (error: any) {
    return { 
      success: false, 
      url: endpoint, 
      error: "Network failure. Check if CORS is enabled on your WordPress site or if the URL is blocked." 
    };
  }
};

/**
 * Utility to generate full URLs for images.
 * @param {string} path - Relative path (e.g., 'uploads/image.jpg') or full URL.
 * @returns {string} - Full absolute URL.
 */
const getFullUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL, return as is
  if (path.startsWith("http")) return path;

  let baseUrl = process.env.BASE_URL || "http://localhost:5000";
  
  // Robust production check: 
  // If NODE_ENV is production, we MUST use the production domain if BASE_URL is localhost or missing
  const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
  const isLocalHost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  if (isProduction && isLocalHost) {
    console.warn(`[WARNING] Production mode detected but BASE_URL is set to localhost (${baseUrl}). Overriding with production domain.`);
    baseUrl = "https://backend.dlksoftwaresolutions.co.in";
  } else if (isProduction && !process.env.BASE_URL) {
    baseUrl = "https://backend.dlksoftwaresolutions.co.in";
  }

  // Remove leading slash if any to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // Ensure no trailing slash on baseUrl
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${normalizedBaseUrl}/${cleanPath}`;
};

module.exports = { getFullUrl };

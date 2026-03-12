/**
 * Utility to generate full URLs for images.
 * @param {string} path - Relative path (e.g., 'uploads/image.jpg') or full URL.
 * @returns {string} - Full absolute URL.
 */
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // Remove leading slash if any
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // Default to production domain if no BASE_URL provided in production environment
  let baseUrl = process.env.BASE_URL || "http://localhost:5000";
  
  if (process.env.NODE_ENV === 'production' && !process.env.BASE_URL) {
    baseUrl = "https://backend.dlksoftwaresolutions.co.in";
  }

  // Ensure no trailing slash on baseUrl
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${normalizedBaseUrl}/${cleanPath}`;
};

module.exports = { getFullUrl };

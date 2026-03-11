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
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";

  return `${baseUrl}/${cleanPath}`;
};

module.exports = { getFullUrl };

export const SERVICES = [
  {
    name: "Render — Spring Boot API",
    url: "https://authentication-vi22.onrender.com/api/authentication/all",
    tag: "backend",
  },
  {
    name: "Neon — PostgreSQL",
    url: "https://authentication-vi22.onrender.com/api/authentication/all",
    tag: "database",
    note: "checked via API",
  },
  {
    name: "Vercel — React Frontend",
    url: process.env.VERCEL_URL || "https://your-app.vercel.app",
    tag: "frontend",
  },
  {
    name: "Netlify — Static Backup",
    url: process.env.NETLIFY_URL || "https://your-app.netlify.app",
    tag: "frontend",
  },
  {
    name: "OCI VM — Nginx Proxy",
    url: process.env.OCI_HEALTH_URL || "http://your-oci-ip/health",
    tag: "infrastructure",
  },
];

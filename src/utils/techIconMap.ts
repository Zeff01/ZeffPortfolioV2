// Mapping of tech names to their icon paths
export const techIconMap: Record<string, string> = {
  // Frontend
  html: "/techicons/html.png",
  css: "/techicons/css.png",
  javascript: "/techicons/javascript.png",
  js: "/techicons/javascript.png",
  typescript: "/techicons/ts.png",
  ts: "/techicons/ts.png",
  react: "/techicons/react.png",
  reactjs: "/techicons/react.png",
  next: "/techicons/nextjs.png",
  nextjs: "/techicons/nextjs.png",
  "next.js": "/techicons/nextjs.png",
  angular: "/techicons/angular.png",
  reactnative: "/techicons/reactnative.png",
  "react native": "/techicons/reactnative.png",
  
  // Styling
  tailwind: "/techicons/tailwind.png",
  tailwindcss: "/techicons/tailwind.png",
  sass: "/techicons/sass.png",
  scss: "/techicons/sass.png",
  bootstrap: "/techicons/bootstrap.png",
  materialui: "/techicons/materialui.png",
  "material ui": "/techicons/materialui.png",
  mui: "/techicons/materialui.png",
  shadcn: "/techicons/shadcn.png",
  "shadcn/ui": "/techicons/shadcn.png",
  
  // Backend
  node: "/techicons/node.png",
  nodejs: "/techicons/node.png",
  "node.js": "/techicons/node.png",
  express: "/techicons/express.png",
  expressjs: "/techicons/express.png",
  php: "/techicons/php.png",
  symfony: "/techicons/symfony.png",
  ror: "/techicons/ror.png",
  rails: "/techicons/ror.png",
  "ruby on rails": "/techicons/ror.png",
  
  // Database
  mongo: "/techicons/mongo.png",
  mongodb: "/techicons/mongo.png",
  postgres: "/techicons/postgresSQL.png",
  postgresql: "/techicons/postgresSQL.png",
  supabase: "/techicons/supabase.png",
  firebase: "/techicons/firebase.png",
  
  // Blockchain
  solidity: "/techicons/solidity.png",
  ethereum: "/techicons/eth.png",
  eth: "/techicons/eth.png",
  polygon: "/techicons/matic.png",
  matic: "/techicons/matic.png",
  solana: "/techicons/solana.png",
  
  // Cloud & DevOps
  aws: "/techicons/aws.png",
  docker: "/techicons/docker.png",
  vercel: "/techicons/vercel.png",
  nginx: "/techicons/nginx.png",
  
  // Other
  github: "/techicons/github.png",
  git: "/techicons/github.png",
  wordpress: "/techicons/wordpress.png",
  openai: "/techicons/openai.png",
  stripe: "/techicons/stripe.png",
  xendit: "/techicons/xendit.png",
  // Note: Redux icon not available in techicons folder
  // Note: Figma icon not available in techicons folder  
  // Note: Python icon not available in techicons folder
};

// Function to get icon path from tech name
export const getTechIcon = (techName: string): string => {
  const normalizedName = techName.toLowerCase().trim();
  return techIconMap[normalizedName] || "/techicons/javascript.png"; // Default fallback
};

// Function to get tech name from icon path
export const getTechNameFromPath = (path: string): string => {
  const filename = path.split("/").pop()?.split(".")[0] || "";
  return filename;
};
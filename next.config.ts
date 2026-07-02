import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      "convex/react": "./lib/mock/convex-react.ts",
      "convex/react-clerk": "./lib/mock/convex-react.ts",
      "@clerk/nextjs": "./lib/mock/clerk.tsx",
      "@clerk/nextjs/experimental": "./lib/mock/clerk-experimental.tsx",
      "@/convex/_generated/api": "./lib/mock/api.ts",
      "@convex-dev/agent/react": "./lib/mock/agent-react.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "convex/react": path.resolve(__dirname, "lib/mock/convex-react.ts"),
      "convex/react-clerk": path.resolve(__dirname, "lib/mock/convex-react.ts"),
      "@clerk/nextjs": path.resolve(__dirname, "lib/mock/clerk.tsx"),
      "@clerk/nextjs/experimental": path.resolve(__dirname, "lib/mock/clerk-experimental.tsx"),
      "@/convex/_generated/api": path.resolve(__dirname, "lib/mock/api.ts"),
      "@convex-dev/agent/react": path.resolve(__dirname, "lib/mock/agent-react.ts"),
    };
    return config;
  },
};

export default nextConfig;


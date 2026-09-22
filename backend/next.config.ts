import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle so the Docker image can skip node_modules.
  output: "standalone",
  reactCompiler: true,
  // This repo documents itself in README.md; skip the generated agent files.
  agentRules: false,
  // Mongoose ships optional native drivers Next should not try to bundle.
  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // This repo documents itself in README.md; skip the generated agent files.
  agentRules: false,
};

export default nextConfig;

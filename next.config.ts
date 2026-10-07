import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  basePath: isGithubPages ? "/VDDayarathne_Portfolio" : "",
  assetPrefix: isGithubPages ? "/VDDayarathne_Portfolio/" : "",
};

export default nextConfig;
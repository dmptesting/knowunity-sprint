import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * This is a design prototype reviewed at a fixed 390px, and the dev
   * indicator sits in the bottom-left corner — right where the voice turn puts
   * "type instead" and the summary puts its action. Compile and runtime errors
   * still surface without it.
   */
  devIndicators: false,
};

export default nextConfig;

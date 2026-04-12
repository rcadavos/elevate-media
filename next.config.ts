import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  // Next 16 defaults to Turbopack; @ducanh2912/next-pwa injects webpack config.
  // Empty `turbopack` satisfies Next when the dev script does not pass `--webpack`.
  turbopack: {},
};

export default withPWA(nextConfig);

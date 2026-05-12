/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/app/poi/:id",
          destination: "/app?poiId=:id",
        },
      ],
    };
  },
};

export default nextConfig;

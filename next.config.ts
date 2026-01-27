import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["@node-rs/argon2"],
 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // port: '', // Optional port
        // pathname: '/**', // Optional pathname with globs
      },
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.anotherexample.org',
      //   pathname: '/my-bucket/**',
      // },
    ],
  }
};

export default nextConfig;

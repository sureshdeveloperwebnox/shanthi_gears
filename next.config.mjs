/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'webnox.blr1.digitaloceanspaces.com',
            },
        ],
    },
};

export default nextConfig;

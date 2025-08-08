/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
            config.resolve.fallback = {
                fs: false,
                path: false,
                canvas: false,
            };
        }
        // Add a rule to handle the canvas package
        config.externals = [...(config.externals || []), {
            canvas: "canvas",
            bufferutil: "bufferutil",
            "utf-8-validate": "utf-8-validate",
        }];

        return config;
    },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Fix for WASM files
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Handle WASM files properly
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Externalize problematic modules on server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@meshsdk/core': '@meshsdk/core',
        '@meshsdk/react': '@meshsdk/react',
      });
    }

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: ['@meshsdk/core', '@meshsdk/react'],
}

module.exports = nextConfig
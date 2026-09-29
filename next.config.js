// module.exports = {
// 	reactStrictMode: true,
// 	swcMinify: true,
// 	experimental: {
// 		optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
// 	},
// };

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'kabbik-space.sgp1.digitaloceanspaces.com',
				port: '',
				pathname: '**',
			},
		],
	},

	reactStrictMode: true,
	swcMinify: true,

	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
					{ key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
					{ key: 'Access-Control-Allow-Headers', value: 'uid' },
				],
			},
		];
	},
};

module.exports = nextConfig;

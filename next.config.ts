const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.join(__dirname), // 明确指定当前项目目录为根
  },
};

module.exports = nextConfig;
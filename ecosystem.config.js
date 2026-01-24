module.exports = {
  apps: [
    {
      name: "Architect-Backend",
      script: "./Backend/server.js",
      cwd: "./Backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "Architect-Frontend",
      // We serve the 'dist' folder for production efficiency
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./vite-project/dist",
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html"
      }
    }
  ]
};
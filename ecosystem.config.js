module.exports = {
  apps: [{
    name: "lawyer-app",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 3000",
    cwd: "/var/www/lawyer-app",
    exec_mode: "fork",
    instances: 1,
    env: { NODE_ENV: "production", PORT: 3000 },
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
  }],
}

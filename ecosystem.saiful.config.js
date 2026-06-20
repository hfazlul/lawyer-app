module.exports = {
  apps: [{
    name: "lawyer-app-saiful",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 3000",
    cwd: "/var/www/lawyer-app-saiful",
    exec_mode: "fork",
    instances: 1,
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      NEXT_PUBLIC_ADMIN_PATH_PREFIX: "saifulAdv",
    },
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
  }],
}

module.exports = {
  apps: [
    {
      name: "kasi",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/kasi",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};

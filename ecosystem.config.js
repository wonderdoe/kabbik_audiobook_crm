module.exports = {
  apps: [
    {
      name: 'crm-admin-panel',
      cwd: __dirname,
      "instances" : "1",
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: "--max-old-space-size=512"
      },
      max_memory_restart: "200M" 
    },
  ],
};

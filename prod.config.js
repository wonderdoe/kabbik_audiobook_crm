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

      },
    },
  ],
};
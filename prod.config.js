module.exports = {
  apps: [
    {
      name: 'crm-admin-panel',
      cwd: '/opt/kabbik-services/kabbik-crm',
      "instances" : "1",
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',

      },
    },
  ],
};
module.exports = {
  apps: [
    {
      name: 'cloudtask',
      script: 'server/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3100,
        APP_NAME: 'CloudTask'
      }
    }
  ]
};

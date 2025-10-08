module.exports = {
  apps: [
    {
      name: 'snkhouse-widget',
      script: 'pnpm',
      args: 'dev',
      cwd: './',
      env: {
        NODE_ENV: 'development'
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};

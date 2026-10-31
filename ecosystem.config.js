module.exports = {
  apps: [
    {
      name: 'typro-backend',
      cwd: '/home/typo/typro/backend',
      script: 'dist/main.js',
      env: {
        PORT: 4000,
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '800M',
    },
    {
      name: 'typro-frontend',
      cwd: '/home/typo/typro/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '1200M',
    },
  ],
};

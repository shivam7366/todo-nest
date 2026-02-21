module.exports = {
  apps: [
    {
      name: 'task-api',
      script: './dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};

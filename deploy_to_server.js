const fs = require('fs');
const path = require('path');
const { Client } = require('./backend/node_modules/ssh2');

const conn = new Client();

console.log('Connecting to server 192.168.1.93...');

conn.on('ready', () => {
  console.log('SSH connection established successfully.');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    const filesToUpload = [
      { local: path.resolve('backend_dist_update.tar.gz'), remote: '/home/typo/backend_dist_update.tar.gz' },
      { local: path.resolve('frontend_src_update.tar.gz'), remote: '/home/typo/frontend_src_update.tar.gz' },
      { local: path.resolve('custom_texts.tar.gz'), remote: '/home/typo/custom_texts.tar.gz' },
    ];

    let uploadIndex = 0;

    function uploadNext() {
      if (uploadIndex >= filesToUpload.length) {
        console.log('All files uploaded to server successfully.');
        runDeploymentCommands();
        return;
      }

      const file = filesToUpload[uploadIndex++];
      console.log(`Uploading ${file.local} -> ${file.remote}...`);
      sftp.fastPut(file.local, file.remote, (err) => {
        if (err) {
          console.error(`Error uploading ${file.local}:`, err);
          conn.end();
          process.exit(1);
        }
        console.log(`Uploaded ${path.basename(file.remote)} (${fs.statSync(file.local).size} bytes)`);
        uploadNext();
      });
    }

    uploadNext();
  });

  function runDeploymentCommands() {
    const commands = [
      'echo "=== 1. Extracting backend dist into backend/dist ==="',
      'tar -xzf /home/typo/backend_dist_update.tar.gz -C /home/typo/typro/backend/',
      'echo "=== 2. Extracting custom texts into backend/data ==="',
      'tar -xzf /home/typo/custom_texts.tar.gz -C /home/typo/typro/backend/data/',
      'echo "=== 3. Extracting frontend src ==="',
      'tar -xzf /home/typo/frontend_src_update.tar.gz -C /home/typo/typro/frontend/',
      'echo "=== 4. Building frontend Next.js ==="',
      'cd /home/typo/typro/frontend && npm run build',
      'echo "=== 5. Restarting PM2 processes ==="',
      'pm2 restart all',
      'pm2 status'
    ];

    const fullCmd = commands.join(' && ');
    console.log('\nExecuting deployment & build script on remote server...');

    conn.exec(fullCmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        conn.end();
        process.exit(1);
      }

      stream.on('close', (code) => {
        console.log(`\nDeployment script finished with exit code ${code}`);
        conn.end();
        process.exit(code || 0);
      }).on('data', (d) => {
        process.stdout.write(d.toString());
      }).stderr.on('data', (d) => {
        process.stderr.write(d.toString());
      });
    });
  }
}).on('error', (err) => {
  console.error('SSH Connection error:', err.message);
  process.exit(1);
}).connect({
  host: '192.168.1.93',
  localAddress: '192.168.2.191',
  port: 22,
  username: 'typo',
  password: 'typo@12345',
  readyTimeout: 30000
});

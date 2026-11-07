const os = require('os');
const fs = require('fs');
const path = require('path');
const { Client } = require('./backend/node_modules/ssh2');

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (name.includes('HotspotShield')) continue;
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return undefined;
}

const localIp = getLocalIp() || '192.168.1.101';
console.log(`Connecting to server 192.168.1.93 via local IP: ${localIp}...`);

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection established successfully.');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    const localFile = path.resolve('frontend_src_fix.tar.gz');
    const remoteFile = '/home/typo/frontend_src_update.tar.gz';

    console.log(`Uploading ${localFile} -> ${remoteFile}...`);
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) {
        console.error(`Error uploading:`, err);
        conn.end();
        process.exit(1);
      }
      console.log(`Uploaded frontend_src_update.tar.gz (${fs.statSync(localFile).size} bytes)`);

      const commands = [
        'echo "=== 1. Extracting frontend src ==="',
        'tar -xzf /home/typo/frontend_src_update.tar.gz -C /home/typo/typro/frontend/',
        'echo "=== 2. Building frontend Next.js ==="',
        'cd /home/typo/typro/frontend && npm run build',
        'echo "=== 3. Restarting PM2 typro-frontend ==="',
        'pm2 restart typro-frontend',
        'pm2 status'
      ];

      const fullCmd = commands.join(' && ');
      console.log('\nExecuting build on remote server...');

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
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err);
  process.exit(1);
}).connect({
  host: '192.168.1.93',
  localAddress: localIp,
  port: 22,
  username: 'typo',
  password: 'typo@12345',
  readyTimeout: 30000,
});

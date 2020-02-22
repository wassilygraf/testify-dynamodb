const shell = require('child_process');

const formatLs = stdout => [...new Set(stdout.split('\n'))];

const ls = async (fileName, flags) => new Promise((resolve, reject) => {
  const args = [];
  if (flags) {
    args.push(...flags);
  }
  args.push(fileName);

  const lsSpawn = shell.spawn('ls', [args, fileName]);
  let stdout = '';
  let stderr = '';

  lsSpawn.stdout.on('data', (data) => { stdout += data; });
  lsSpawn.stderr.on('data', (data) => { stderr += data; });

  lsSpawn.on('error', () => reject(stderr));
  lsSpawn.on('close', () => resolve(formatLs(stdout)));
});

const getStackFileNames = async (stackFolder) => {
  const files = await ls(stackFolder);
  return files.filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));
};

module.exports = {
  ls,
  getStackFileNames,
};

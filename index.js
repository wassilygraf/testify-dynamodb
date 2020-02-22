const { main } = require('./src/main');

const DEFAULT_FOLDER = `${__dirname}/stacks`;
const [stackFolder] = process.argv.slice(2);

main(stackFolder || DEFAULT_FOLDER);

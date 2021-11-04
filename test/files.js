const { expect } = require('chai');

const STACKS_FOLDER = `${__dirname}/../stacks`;

const {
  getStackFileNames,
} = require('../src/lib/files');

describe('files', () => {
  context('getStackFileNames', () => {
    it('returns 4 file names', async () => {
      const fileNames = await getStackFileNames(STACKS_FOLDER);
      expect(fileNames).to.be.an('array');
      expect(fileNames.length).to.equal(4);
    });
  });
});

const { expect } = require('chai');

const {
  getDynamodbTableDefinitions,
} = require('../src/main');

const FILENAMES = [
  'accounts-table.yml',
  'referrals-table.yml',
  'sns-event.yml',
];

const STACK_FOLDER = `${__dirname}/../stacks`;

describe('main', () => {
  context('getDynamodbTableDefinitions', () => {
    it('returns two objects', () => {
      const dynamodbDefintions = getDynamodbTableDefinitions(STACK_FOLDER, FILENAMES);
      expect(dynamodbDefintions.length).to.equal(2);
      expect(dynamodbDefintions[0]).to.be.an('object');
    });
  });
});

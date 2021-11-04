/* eslint-disable no-underscore-dangle, no-unused-expressions */
const AWS = require('aws-sdk');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { expect } = chai;

const {
  getDynamodbTableDefinitions,
  tableExists,
  main,
} = require('../src/main');

const {
  AWS_REGION,
  ENDPOINT_URL = 'localhost:8000',
} = process.env;

const dynamodb = new AWS.DynamoDB({
  region: AWS_REGION || 'eu-west-1',
  apiVersion: '2012-08-10',
  endpoint: `http://${ENDPOINT_URL}`,
});

const FILENAMES = [
  'accounts-table.yml',
  'referrals-table.yml',
  'foo-table-bar-name.yml',
  'sns-event.yml',
];

const STACK_FOLDER = `${__dirname}/../stacks`;

describe('main', () => {
  context('getDynamodbTableDefinitions', () => {
    it('returns two tables using the resource name as a default table name, and one table using the table name property from the config', () => {
      const dynamodbDefintions = getDynamodbTableDefinitions(STACK_FOLDER, FILENAMES);
      expect(dynamodbDefintions.length).to.equal(3);

      expect(dynamodbDefintions[0].TableName).to.equal('AccountsTable');
      expect(dynamodbDefintions[1].TableName).to.equal('ReferralsTable');
      expect(dynamodbDefintions[2].TableName).to.equal('BarTable');
      expect(dynamodbDefintions[0]).to.be.an('object');
    });
  });

  context('main', () => {
    it('creates two tables', async () => {
      const TableName = 'AccountsTable';
      await main('stacks');
      const accountsTable = await dynamodb.describeTable({ TableName }).promise();
      expect(accountsTable).to.be.an('object');
    });
  });

  context('tableExists', async () => {
    const TableName = 'TestTable';

    beforeEach(async () => {
      await dynamodb.createTable({
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'accountId', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'accountId', KeyType: 'RANGE' },
        ],
        TableName,
      }).promise();
    });

    afterEach(async () => {
      await dynamodb.deleteTable({ TableName }).promise();
    });

    it('returns true for an existing table', async () => {
      const exists = await tableExists(TableName);
      expect(exists).to.be.true;
    });

    it('returns false for non-existent table', async () => {
      const exists = await tableExists('NonExistentTable');
      expect(exists).to.be.false;
    });
  });

  context('dynamodb', () => {
    it('throws error for non-existent table', async () => {
      const TableName = 'SomeNonExistentTable';
      const promise = dynamodb.describeTable({ TableName }).promise();
      await expect(promise).to.eventually.be.rejected;
    });
  });
});

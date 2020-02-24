const log = require('bunyan-wrapper')('dynamodb-test-suit');
const { schema } = require('yaml-cfn');
const { safeLoad } = require('js-yaml');
const AWS = require('aws-sdk');
const fs = require('fs');

const {
  getStackFileNames,
} = require('./lib/files');

const {
  AWS_REGION,
  ENDPOINT_URL = 'localhost:8000',
} = process.env;

const dynamodb = new AWS.DynamoDB({
  region: AWS_REGION || 'eu-west-1',
  apiVersion: '2012-08-10',
  endpoint: `http://${ENDPOINT_URL}`,
});

const DYNAMODB_TABLE_TYPE = 'AWS::DynamoDB::Table';

const readAndParseFile = (path) => {
  const file = fs.readFileSync(path, 'utf-8');
  return safeLoad(file, { schema });
};

const toDynamoTypes = resources => (acc, name) => {
  if (resources[name].Type === DYNAMODB_TABLE_TYPE) {
    acc.push({ ...resources[name], TableName: name });
  }
  return acc;
};

const todynamodbDefintions = (acc, stack) => {
  const { Resources: resources } = stack;
  const resourceNames = Object.keys(resources);
  const dynamodbDefinitions = resourceNames.reduce(toDynamoTypes(resources), []);
  return [
    ...acc,
    ...dynamodbDefinitions,
  ];
};

const getDynamodbTableDefinitions = (stackFolder, fileNames) => {
  const files = fileNames.map(fileName => readAndParseFile(`${stackFolder}/${fileName}`));
  return files.reduce(todynamodbDefintions, []);
};

const tableExists = async (TableName) => {
  try {
    await dynamodb.describeTable({ TableName }).promise();
    return true;
  } catch (err) {
    if (err.code === 'ResourceNotFoundException') {
      return false;
    }
    throw err;
  }
};

const createTableIfNotExists = async (tableDefinition) => {
  const {
    Properties: {
      BillingMode,
      AttributeDefinitions,
      KeySchema,
      GlobalSecondaryIndexes,
    },
    TableName,
  } = tableDefinition;

  if (await tableExists(TableName)) {
    log.info('Table %s already exists, will not create..', TableName);
    return null;
  }

  const params = {
    BillingMode,
    AttributeDefinitions,
    KeySchema,
    GlobalSecondaryIndexes,
    TableName,
  };
  log.info(JSON.stringify(params));

  await dynamodb.createTable(params).promise();
  log.info('The %s table has been created!', TableName);
  return null;
};

const main = async (stackFolder) => {
  log.info('Fetching dynamodb definitions from %s folder', stackFolder);
  const stackFileNames = await getStackFileNames(stackFolder);
  const dynamodbTableDefinitions = getDynamodbTableDefinitions(stackFolder, stackFileNames);

  await Promise.all(dynamodbTableDefinitions.map(createTableIfNotExists));
  log.info('All DynamoDB Tables Have been created!');
};

module.exports = {
  getDynamodbTableDefinitions,
  tableExists,
  main,
};

import AWS from 'aws-sdk'

AWS.config.update({
  region: 'us-east-1',
  endpoint: 'dynamodb.us-east-1.amazonaws.com',
  accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY,
  secretAccessKey: import.meta.env.VITE_APP_AWS_CLEINT_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default dynamodb;

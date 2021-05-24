const AWS = require('aws-sdk');
AWS.config.update( {
  region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'Message';
const healthPath = '/health';
const messagePath = '/message';

exports.handler = async function(event) {
  console.log('Request event: ', event);
  let response;
  switch(true) {
    case event.httpMethod === 'GET' && event.path === healthPath:
      response = buildResponse(200);
      break;
    case event.httpMethod === 'GET' && event.path === messagePath:
      response = await getMessage(event.queryStringParameters.messageId);
      break;
    case event.httpMethod === 'POST' && event.path === messagePath:
      response = await saveMessage(JSON.parse(event.body));
      break;
    case event.httpMethod === 'DELETE' && event.path === messagePath:
      response = await deleteMessage(JSON.parse(event.body).messageId);
      break;
    default:
      response = buildResponse(404, '404 Not Found');
  }
  return response;
}

async function getMessage(messageId) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'messageId': messageId,
      "status": "False"
    }
  }
  
  return await dynamodb.get_item(params).promise().then((response) => {
    return buildResponse(200, response.Item);
  }, (error) => {
    console.error('error: ', error);
  });
}

async function saveMessage(requestBody) {
  const params = {
    TableName: dynamodbTableName,
    Item: requestBody
  }
  return await dynamodb.put(params).promise().then(() => {
    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
      Item: requestBody
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('error: ', error);
  })
}

async function deleteMessage(messageId) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'messageId': messageId,
    }
  }
  return await dynamodb.delete(params).promise().then((response) => {
    const body = {
      Operation: 'DELETE',
      Message: 'SUCCESS',
      Item: response
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('error: ', error);
  })
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

const AWS = require('aws-sdk');
AWS.config.update( {
  region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'Message';
const dynamodbTableName2 = 'users';
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
      response = await getMessage();
      break;
    case event.httpMethod === 'POST' && event.path === messagePath:
      response = await saveMessage(JSON.parse(event.body));
      break;
    case event.httpMethod === 'DELETE' && event.path === messagePath:
      response = await deleteMessage(JSON.parse(event.body).messageId);
      break;
    case event.httpMethod === 'PATCH' && event.path === messagePath:
      response = await updateMessage();
      break;
    default:
      response = buildResponse(404, '404 Not Found');
  }
  return response;
}

async function getMessage() {
  const params = {
    TableName: dynamodbTableName,
    //FilterExpression: "contains(message, :message)",
    FilterExpression: "begins_with(message, :message)",
    ExpressionAttributeValues:{
      ":message":"I"
    }
  }
  
  return await dynamodb.scan(params).promise().then((response) => {
    console.log(response.Items)
    return buildResponse(200, response.Items);
  }, (error) => {
    console.error('error: ', error);
  });
}

async function updateMessage() {
  const params = {
    TableName: dynamodbTableName,
    Key: {
            "id": "1"
    },
    UpdateExpression: "set message = :x, #MyVariable = :y",
    ExpressionAttributeNames: {
      "#MyVariable": "messageType"
    },
    ExpressionAttributeValues: {
      ":x": "I am Disha Agarwal",
      ":y": "Formal Message"
    }
  }
  console.log(params)
  
  return await dynamodb.update(params).promise().then((response) => {
    //console.log(response);
    return buildResponse(200, response);
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

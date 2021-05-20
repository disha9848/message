var AWS= require('aws-sdk');
let awsConfig ={
    "region" : "us-east-1",
    "endpoint" : "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": "AKIA6L5HW77PZRI5YKE6", "secretAccessKey":"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"
};

AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();
let remove = function() {
    var params = {
        TableName: "users",
        Key: {
            "email_id" : "disha@gmail.com"
        }
    };
        docClient.delete(params, function(err, data){
            console.log("data")
            if(err){
                console.log("users::remove::error - "+ JSON.stringify(err, null, 2));
            }
            else{
                console.log("users::remove::success");
            }
        })
}

remove();
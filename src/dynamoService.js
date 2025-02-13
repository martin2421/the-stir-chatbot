import dynamodb from './aws-config';
// import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ExecuteStatementCommand, DeleteCommand } from
//     '@aws-sdk/lib-dynamodb';
// import { v4 as uuidv4 } from 'uuid';

export const insertData = async (data) => {

  let params1 = {
    TableName: "Prospects",
    Key: {
      id: -1,
    },
  }

  let res = await dynamodb.scan(params1).promise();
  let item = res.Items[0];

  console.log(item);
  const params = {
    TableName: 'Prospects',
    Item: {
      id: item.nextId,
      firstName: data.f_name,
      lastName: data.l_name,
      email: data.email,
      phoneNumber: data.phone,
    }
  };
  try {
    await dynamodb.put(params).promise();

    dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: -1,
        },
        UpdateExpression: `set nextId = :next`,
        ExpressionAttributeValues: {
          ":next": item.nextId + 1,
        },
      })
      .promise()


    return { success: true, message: 'INSERTED' };

  } catch (error) {
    console.log("chale");
    return { success: false, message: error.message };
  }
}


export const searchData = async (data) => {

  dynamodb
    .scan({
      TableName: "Prospects",
      FilterExpression:
        "attribute_not_exists(deletedAt) AND contains(email, :email)",
      ExpressionAttributeValues: {
        ":email": data.email,
      },
    })
    .promise()
    .then(function () {
      if (data != undefined) {
        console.log(data.Items[0]);
        return true;
      } else {
        return false;
      }
    }
    )
    .catch(console.error)
}
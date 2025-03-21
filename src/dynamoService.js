import dynamodb from './aws-config';


export const searchData = async (data) => {

  return dynamodb
    .scan({
      TableName: "stir-test2",
      FilterExpression:
        "attribute_not_exists(deletedAt) AND email = :email",
      ExpressionAttributeValues: {
        ":email": data.email,
      },
    })
    .promise()
    .then(function (data) {
      if (data.Items[0] != undefined) {
        return { success: true, id: data.Items[0].id, email: data.Items[0].email, firstName: data.Items[0].firstName, lastName: data.Items[0].lastName, businessName: data.Items[0].businessName, phoneNumber: data.Items[0].phoneNumber, stateChat: data.Items[0].currentState, chat: data.Items[0].chatHistory, businessStage: data.Items[0].businessStage, dateCreated: data.Items[0].createdAt, service: data.Items[0].service};
      } else {
        return { success: false };
      }
    }
    )
    .catch(console.error)
}

export const insertData = async (data) => {

  let params1 = {
    TableName: "stir-test2",
    Key: {
      id: -1,
    },
  }

  let res = await dynamodb.scan(params1).promise();
  let item = res.Items[0];

  const params = {
    TableName: 'stir-test2',
    Item: {
      id: item.nextId,
      firstName: data.f_name,
      lastName: data.l_name,
      businessName: data.b_name,
      email: data.email,
      phoneNumber: data.phone,
      createdAt: data.today,
      isActive: true,
    }
  }

  try {
    await dynamodb.put(params).promise();

    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: -1,
        },
        UpdateExpression: `set nextId = :next`,
        ExpressionAttributeValues: {
          ":next": item.nextId + 1,
        },
      })
      .promise()


    return { success: true, userId: item.nextId, message: 'INSERTED' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export const insertStateData = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set currentState = :state`,
        ExpressionAttributeValues: {
          ":state": data.stateChat,
        },
      })
      .promise()

    return { success: true, message: 'State was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertChatHistory = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set chatHistory = :chat`,
        ExpressionAttributeValues: {
          ":chat": data.chat,
        },
      })
      .promise()

    return { success: true, message: 'Chat was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertBusinessStage = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set businessStage = :stage`,
        ExpressionAttributeValues: {
          ":stage": data.businessStage,
        },
      })
      .promise()

    return { success: true, message: 'Business stage was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertBusinessType = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set businessType = :type`,
        ExpressionAttributeValues: {
          ":type": data.businessType,
        },
      })
      .promise()

    return { success: true, message: 'Business type was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertSignedUp = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set Signed up as Stir Member. = :signed`,
        ExpressionAttributeValues: {
          ":signed": data.signedUp,
        },
      })
      .promise()

    return { success: true, message: 'Food Corridor Signed up updated!' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertLicences = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set licenses = :license`,
        ExpressionAttributeValues: {
          ":license": data.licenses,
        },
      })
      .promise()

    return { success: true, message: 'Licenses were saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertService = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set service = :serv`,
        ExpressionAttributeValues: {
          ":serv": data.service,
        },
      })
      .promise()

    return { success: true, message: 'Service was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertProducts = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set products = :product`,
        ExpressionAttributeValues: {
          ":product": data.products,
        },
      })
      .promise()

    return { success: true, message: 'Products were saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertNote = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set notes = :note`,
        ExpressionAttributeValues: {
          ":note": data.note,
        },
      })
      .promise()

    return { success: true, message: 'Note was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertTimeNeeded = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set spaceNeeds = :space`,
        ExpressionAttributeValues: {
          ":space": data.timeNeeded,
        },
      })
      .promise()

    return { success: true, message: 'Time was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertEventVenue = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set eventVenue = :venue`,
        ExpressionAttributeValues: {
          ":venue": data.venue,
        },
      })
      .promise()

    return { success: true, message: 'Event Venue was saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}
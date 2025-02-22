import dynamodb from './aws-config';


export const searchData = async (data) => {

  return dynamodb
    .scan({
      TableName: "Prospects",
      FilterExpression:
        "attribute_not_exists(deletedAt) AND email = :email",
      ExpressionAttributeValues: {
        ":email": data.email,
      },
    })
    .promise()
    .then(function (data) {
      if (data.Items[0] != undefined) {
        return { success: true, id: data.Items[0].id, email: data.Items[0].email, firstName: data.Items[0].firstName, lastName: data.Items[0].lastName, phoneNumber: data.Items[0].phoneNumber, stateChat: data.Items[0].stateChat, chat: data.Items[0].chat };
      } else {
        return { success: false };
      }
    }
    )
    .catch(console.error)
}



export const insertData = async (data) => {

  let params1 = {
    TableName: "Prospects",
    Key: {
      id: -1,
    },
  }

  let res = await dynamodb.scan(params1).promise();
  let item = res.Items[0];

  const params = {
    TableName: 'Prospects',
    Item: {
      id: item.nextId,
      firstName: data.f_name,
      lastName: data.l_name,
      businessName: data.b_name,
      email: data.email,
      phoneNumber: data.phone,
      createdAt: data.today
    }
  }

  try {
    await dynamodb.put(params).promise();

    await dynamodb
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


    return { success: true, userId: item.nextId, message: 'INSERTED' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}



export const insertStateData = async (data) => {

  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
        },
        UpdateExpression: `set stateChat = :state`,
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

  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
        },
        UpdateExpression: `set chat = :chat`,
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
  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
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



export const insertSignedUp = async (data) => {
  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
        },
        UpdateExpression: `set signedUp = :signed`,
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
  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
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
  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
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
  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
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
  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
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



export const insertEventVenue = async (data) => {
  let result = await searchData({ email: data.email })

  try {
    await dynamodb
      .update({
        TableName: "Prospects",
        Key: {
          id: Number(result.id),
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
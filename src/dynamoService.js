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
        return { success: true, id: data.Items[0].id, email: data.Items[0].email, firstName: data.Items[0].firstName, lastName: data.Items[0].lastName, businessName: data.Items[0].businessName, phoneNumber: data.Items[0].phoneNumber, stateChat: data.Items[0].currentState, chat: data.Items[0].chatHistory, businessStage: data.Items[0].businessStage, dateCreated: data.Items[0].createdAt, service: data.Items[0].service };
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
        UpdateExpression: `set dateSignedUp = :signed`,
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

export const insertStorageNeeds = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set storageNeeds = :storageNeed`,
        ExpressionAttributeValues: {
          ":storageNeed": data.storageNeed,
        },
      })
      .promise()

    return { success: true, message: 'Storage Needs were saved' };

  } catch (error) {
    return { success: false, message: error };
  }
}

export const insertEventEquipment = async (data) => {

  try {
    await dynamodb
      .update({
        TableName: "stir-test2",
        Key: {
          id: data.userId,
        },
        UpdateExpression: `set eventVenueEquipment = :equipmentN`,
        ExpressionAttributeValues: {
          ":equipmentN": data.equipment,
        },
      })
      .promise()

    return { success: true, message: 'Event Venue Equipment was saved' };
  } catch (error) {
    return { success: false, message: error };
  }
}

export const getCustomerInformation = async (data) => {

  return dynamodb
    .query({
      TableName: "stir-test2",
      KeyConditionExpression: `id = :myId`,
      ExpressionAttributeValues: {
        ":myId": Number(data.user),
      },
    })
    .promise()
    .then(function (data) {
      if (data.Items != undefined) {

        let returningData;
        if (data.Items[0].service == 'Warehouse Storage Rental'){
          returningData = {
            firstName: data.Items[0].firstName,
            lastName: data.Items[0].lastName,
            email: data.Items[0].email,
            phoneNumber: data.Items[0].phoneNumber,
            service: data.Items[0].service,
            dry_storage: JSON.parse(data.Items[0].storageNeeds).dryStorage,
            frozen_storage: JSON.parse(data.Items[0].storageNeeds).frozenStorage,
          }
        } else if(data.Items[0].service == 'Event Venue Rental'){
          returningData = {
            firstName: data.Items[0].firstName,
            lastName: data.Items[0].lastName,
            email: data.Items[0].email,
            phoneNumber: data.Items[0].phoneNumber,
            service: data.Items[0].service,
            venue_location: JSON.parse(data.Items[0].eventVenue).venue_location,
            venue_capacity: JSON.parse(data.Items[0].eventVenue).venue_capacity,
            venue_equipment: JSON.parse(data.Items[0].eventVenue).venue_equipment,
            notes: data.Items[0].notes,
          }
        }
        else if(data.Items[0].service == 'Food Business Coaching'){
          returningData = {
            firstName: data.Items[0].firstName,
            lastName: data.Items[0].lastName,
            email: data.Items[0].email,
            phoneNumber: data.Items[0].phoneNumber,
            service: data.Items[0].service,
            coaching_type: data.Items[0].businessType,
            notes: data.Items[0].notes,
          }
        }
        else {
          returningData = {
            firstName: data.Items[0].firstName,
            lastName: data.Items[0].lastName,
            email: data.Items[0].email,
            phoneNumber: data.Items[0].phoneNumber,
            service: data.Items[0].service,
          }
        }
        return returningData;
      }
      else{
          return { success: false };
        }
      }
    )
    .catch(console.error)
}
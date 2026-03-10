import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DATA_TABLE;

// Valid data keys — must match the AsyncStorage keys used by the mobile app.
const VALID_KEYS = new Set([
  'userProfile',
  'workouts',
  'activeWorkout',
  'workoutTemplates',
  'calorieDays',
  'calorieGoal',
  'draftFoodEntry',
  'savedMeals',
  'runs',
  'activeRun',
]);

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

function getUserId(event) {
  // Cognito authorizer injects claims into the request context.
  return event.requestContext?.authorizer?.claims?.sub ?? null;
}

// GET /data — return all stored keys for the authenticated user.
async function getAll(userId) {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    })
  );

  const items = {};
  for (const row of result.Items ?? []) {
    items[row.dataKey] = JSON.parse(row.data);
  }

  return response(200, { items });
}

// GET /data/{key} — return a single key.
async function getItem(userId, dataKey) {
  if (!VALID_KEYS.has(dataKey)) {
    return response(400, { error: `Invalid data key: ${dataKey}` });
  }

  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: { userId, dataKey },
    })
  );

  if (!result.Item) {
    return response(404, { error: 'Not found' });
  }

  return response(200, { key: dataKey, data: JSON.parse(result.Item.data) });
}

// PUT /data/{key} — upsert a key with a JSON body.
async function putItem(userId, dataKey, body) {
  if (!VALID_KEYS.has(dataKey)) {
    return response(400, { error: `Invalid data key: ${dataKey}` });
  }

  let parsed;
  try {
    parsed = typeof body === 'string' ? JSON.parse(body) : body;
  } catch {
    return response(400, { error: 'Request body must be valid JSON' });
  }

  // Enforce a 400 KB limit per item (DynamoDB max is 400 KB).
  const dataStr = JSON.stringify(parsed);
  if (dataStr.length > 390_000) {
    return response(413, { error: 'Payload too large (max ~390 KB per key)' });
  }

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        userId,
        dataKey,
        data: dataStr,
        updatedAt: Date.now(),
      },
    })
  );

  return response(200, { key: dataKey, updatedAt: Date.now() });
}

// DELETE /data/{key} — remove a key.
async function deleteItem(userId, dataKey) {
  if (!VALID_KEYS.has(dataKey)) {
    return response(400, { error: `Invalid data key: ${dataKey}` });
  }

  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { userId, dataKey },
    })
  );

  return response(200, { deleted: dataKey });
}

export async function handler(event) {
  const userId = getUserId(event);
  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

  const method = event.httpMethod;
  const key = event.pathParameters?.key ?? null;

  try {
    if (method === 'GET' && !key) {
      return await getAll(userId);
    }
    if (method === 'GET' && key) {
      return await getItem(userId, key);
    }
    if (method === 'PUT' && key) {
      return await putItem(userId, key, event.body);
    }
    if (method === 'DELETE' && key) {
      return await deleteItem(userId, key);
    }

    return response(400, { error: 'Unsupported operation' });
  } catch (err) {
    console.error('Handler error', err);
    return response(500, { error: 'Internal server error' });
  }
}

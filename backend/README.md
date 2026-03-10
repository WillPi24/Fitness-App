# Helm Backend

AWS serverless backend for the Helm fitness app.

## Architecture

- **Cognito** — email/password user authentication
- **DynamoDB** — single-table key-value store (syncs AsyncStorage data)
- **API Gateway** — REST API with Cognito JWT authorizer
- **Lambda** — single Node.js function handling all CRUD routes

## API Endpoints

All endpoints require a Cognito ID token in the `Authorization` header.

| Method | Path           | Description                        |
|--------|----------------|------------------------------------|
| GET    | /data          | Get all stored data for the user   |
| GET    | /data/{key}    | Get a single data key              |
| PUT    | /data/{key}    | Create or update a data key (JSON) |
| DELETE | /data/{key}    | Delete a data key                  |

Valid keys: `userProfile`, `workouts`, `activeWorkout`, `workoutTemplates`,
`calorieDays`, `calorieGoal`, `draftFoodEntry`, `savedMeals`, `runs`, `activeRun`

## Prerequisites

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured with credentials
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Deploy

```bash
cd backend
sam build
sam deploy --guided
```

On first deploy, SAM will prompt for a stack name (e.g. `helm-backend`) and region.
It saves your choices to `samconfig.toml` so subsequent deploys are just:

```bash
sam build && sam deploy
```

## After Deploy

The stack outputs three values you need for the mobile app:

| Output            | Usage                                     |
|-------------------|-------------------------------------------|
| UserPoolId        | Configure Cognito in the app              |
| UserPoolClientId  | The app client ID for auth calls          |
| ApiUrl            | Base URL for sync API (e.g. PUT /data/workouts) |

## Cost

With PAY_PER_REQUEST billing on DynamoDB and Lambda's free tier:

- **~1,000 users**: effectively free (well within free tier)
- **~10,000 users**: a few pounds per month
- Cognito: first 50,000 MAUs are free

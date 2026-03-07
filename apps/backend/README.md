## Backend Setup

This part can be a little tricky! If you run into some confusing errors along the way, don't be afraid to reach out if have any trouble!

You'll need to download:

1. [PostgreSQL](https://www.postgresql.org/download/)
2. [PgAdmin 4](https://www.pgadmin.org/download/) (if PostgreSQL didn't come with it)

Then, set up a database called `securing-safe-food`. If you're not familiar with how to do so, it's easy to do through PgAdmin

1. Open PgAdmin and configure your credentials (if necessary). Then, right click on the `Databases` dropdown (under `Servers` > `PostgreSQL [version]`)

![alt text](resources/pg-setup-1.png)

2. Enter "securing-safe-food" as the database name

![alt text](resources/pg-setup-2.png)

Next, create a file called `.env` in the **root directory** (under `ssf/`) and copy over the contents from `.env.example`. Replace `DATABASE_PASSWORD` with the password you entered for the `postgres` user (NOT necessarily your PgAdmin master password!)

You can check that your database connection details are correct by running `nx serve backend` - if you can see the following line in the terminal, then you've got it right!

```
"LOG 🚀 Application is running on: http://localhost:3000/api"
```

Finally, run `yarn run typeorm:migrate` to load all the tables into your database. If everything is set up correctly, you should see "Migration ... has been executed successfully." in the terminal.

# AWS Setup

We have a few environment variables that we utilize to access several AWS services throughout the application. Below is a list of each of them and how to access each after logging in to AWS

1. `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`:

   - Click on your username in the top right corner, and navigate to Security Credentials
   - Scroll down to access keys, and create a new key
   - Select "Local code" as the purpose for the key, and add an optional description
   - Replace both the public and secret keys in the .env file to those values. Note that the secret key will not be accessible after you leave this page
   - Click done

2. `AWS_REGION`:
   This can be found next to your profile name when you login to the main page. Some accounts may be different, but we generally use us-east-1 or us-east-2.
   This is the region that you find on the right side after clicking on the location dropdown, usually saying "United States (_some region_)".
   For example, if we want to use Ohio as the region, we would put `AWS_REGION="us-east2"`

3. `AWS_BUCKET_NAME`:
   This one is already given to you. As of right now, we only use one bucket, confirm-delivery-photos to store photos in a public S3 Bucket. This may be subject to change as we use S3 more in the project.

4. `COGNITO_CLIENT_SECRET`:
   This is used to help authenticate you with AWS Cognito and allow you to properly sign in using proper credential. To find this:

   - Navigate to AWS Cognito
   - Make sure you are on "United States (N. Virginia) as your region
   - Go into User pools and click on the one that says "ssf" (NOTE: You can also validate the User pool id in the `auth/aws_exports.ts` file)
   - Go to App Clients, and click on 'ssf client w secret'
   - There, you can validate the information in `auth/aws_exports.ts` (the `userPoolClientId`), as well as copy the client secret into your env file

5. Creating a new user within AWS Cognito
   There are 2 ways you can create a new user in AWS Cognito. The simplest, is through loading the app, going to the signup page, and creating a new account there. If you choose to do it alternatively through the console, follow these steps:
   - Navigate to AWS Cognito
   - Make sure you are on "United States (N. Virginia)" as your region
   - Go into User pools and click on the one that says "ssf"
   - Go to Users
   - If you do not already see your email there, create a new User, setting an email and password (this will be what you login with on the frontend)
   - Click 'Create User'
   - Load up the app, and go to the login page
   - Verify you are able to login with these new credentials you created

### Running backend tests

1. Create a **separate** Postgres database (for example `securing-safe-food-test`).
2. Add a `DATABASE_NAME_TEST` entry (and optionally `DATABASE_HOST/PORT/USERNAME/PASSWORD`) to your `.env` so the test data source can connect to that database.
3. Run the backend test suite with `npx jest`.

Each spec builds up the database and tables, tears it all down, and runs all the migrations on each tests. This ensures that we always have the most up to date data that we test with.

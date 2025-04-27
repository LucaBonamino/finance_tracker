# Finance tracker

App to keep track of your finances.
The app is an experiment created from a simple web framework built from scratch without the react library.

Ideal to be used in a local network in the family. No log in is needed.

## Features
1. Fast filtering of your transactions using Datatables.
2. Group the transactions by types and category and show intuitive respective pie charts.
3. Aggregate transaction by month.
4. Insert new transactions and update existing transactions.
5. Insert transaction by importing json files.

## Setup

Install the packages by

<code>make setup</code>

## Run the app

### Back end
Start PostgresQL DB
<code>cd backend</code>
<code>docker-compose up postgres</code>

Start Fast api
```shell
cd backend
uvicorn fin_pool.main:app --host 0.0.0.0 --port 8000 --reload
```

### Front-end

Run parcel by
```shell
cd frontend
npm run start-parcel
```
In the <code>Config.ts</code>, you can set the url of the backend server if your server is not in localhost.

### To initialize tha database with dummy data
1. Start the postgres DB
2. Start the Fast API
3. Navigate to [the Fast API docs](http://0.0.0.0:8000/docs)
4. Run the <b>upload file</b> end point with the file <i>dummy_db_json</i> file provided.

<b>Note:</b> 
1. This must be done through the FastAPI documentation interface, as the feature is currently not enabled from the frontend.
2. Only json files are supported.

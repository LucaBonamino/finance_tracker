# Finance tracker

App to keep track of your finances.
The app is an experiment created from a simple web framework built from scratch without the react library.

Ideal to be used in a local network in the family. No log in is needed.

## Features
1. Fast filtering of your transactions using Datatables.
2. Group the transactions by types and category and show intuitive respective pie charts.
3. Aggregate transaction by month.
4. Insert new transactions and update existing transactions.
5. Insert transaction by importing json, CSV or Excel files.

<b>Note</b>: the processing of the data (i.e. aggregation of the transactions and simple statistics) are done in the front end. This is done to support point 2 in the "Next feature" section without having to use FHE.

## Future features
1. Add API authentication on the backend and login in the front end.
2. Add secret-key encryption on the front end. The back will not be able to decrypt the data.

## Setup

Install the packages by

<code>make setup</code>

## Run the app

### Back end
Start PostgresQL DB
<code>cd backend</code>
<code>docker-compose up postgres</code>

Start Fast api
<code>cd backend</code>
</code>uvicorn fin_pool.main:app --host 0.0.0.0 --port 8000 --reload</code>

### Front-end

Run parcel by
<code>cd backend</code>
<code>npm run start-parcel</code>

In the <code>Config.ts</code>, you can set the url of the backend server if your server is not in localhost.


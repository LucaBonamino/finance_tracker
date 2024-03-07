# Finance tracker

App to keep track of your finances.
The app is an experiment created from a simple web framework built from scratch without the react library.

Ideal to be used in a local network in the family. No log in is needed.

## Setup

Install the packages by

<code>npm run install</code>

## Run the app

### Front-end

Run parcel by

<code>npm run start-parcel</code>

### Back-end

The back-end is handled by the json-server package. Simply start it and you are good to go.
Run the json server by

<code>npm run start-db</code>

If it is not already present, the file <code>db.json</code> will be created, make sure to create a <em>transactions</em> field in the json file in such way

<code>{"transactions": []}</code>

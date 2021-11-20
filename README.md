# Google Spreadsheet API

Perform CRUD operations on google spreadsheet using Google cloud platform (GCP)

### prerequisite

- Google spreadsheet ID
- GCP private key
- GCP client email

### How to use

#### Initialize

```javascript
const spreadsheetId = process.env.GOOG_SPREADSHEET_ID;
const credentials = {
  private_key: process.env.GCP_PRIVATE_KEY,
  client_email: process.env.GCP_CLIENT_EMAIL
};
const googapi = new GoogSheetApi(spreadsheetId, credentials, {
  skipFirstRow: false,
  sheets: {
    Sheet1: ['name', 'email', 'password']
  }
});
```

#### Add record

```javascript
googapi.sheet('Sheet1').add({
  name: 'John Doe',
  email: 'john@gmail.com',
  password: 'john'
});
// returns promise
// resolve: { affectedRows: 0, addedRows: 1, status: true }
```

#### Find records

```javascript
googapi.sheet('Sheet1').find(); // get all rows from Sheet1
googapi.sheet('Sheet1').find({ where: { name: 'John Doe' } });
// returns promise
// resolve: { affectedRows: 0, addedRows: 0, records: [], status: true }
```

#### Update records

```javascript
googapi.sheet('Sheet1').update(
  { name: 'John Doe' },
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: 'john'
  }
);
// returns promise
// resolve: { affectedRows: 1, addedRows: 0, status: true }
```

#### Delete records

```javascript
googapi.sheet('Sheet1').delete({ name: 'John Doe' });
// returns promise
// resolve: { affectedRows: 1, addedRows: 0, status: true }
```

#### Run Script

```sh
$ yarn start
$ yarn build  # production build
```

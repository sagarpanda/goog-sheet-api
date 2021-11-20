const { google } = require('googleapis');
import Sheet from './Sheet';
import { googleAuthJWT } from './utils';

interface Credentials {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
}

interface Token {
  access_token: string;
  token_type: string;
  expiry_date: number;
  refresh_token: string;
}

interface ConfigSheets {
  [key: string]: string[];
}

interface Config {
  createSheet?: boolean;
  defaultSheet?: string;
  skipFirstRow?: boolean;
  sheets: ConfigSheets;
}

/**
// Ex. Initialize
const googapi = new GoogSheetApi(spreadsheetId, credentials, {
  createSheet: true, // create sheet if not exists
  defaultSheet: 'Sheet1',
  skipFirstRow: false,
  sheets: { // spreadsheet with schema
    Sheet1: ["name", "email", "password"],
    Sheet2: ["name", "email", "password"]
  }
});

// Ex. Get records
googapi.find(); // get all rows from default sheet i.e. Sheet1
googapi.sheet("Sheet1").find(); // get all rows from Sheet1
googapi.sheet("Sheet1").find({ where: { name: "John Doe" } });

// Ex. Add record
googapi.sheet("Sheet1").add({
  name: "John Doe",
  email: "john@gmail.com",
  password: "john"
});

// Ex. Update record
googapi.sheet("Sheet1").update({ name: "John Doe" }, {
  name: "John Doe",
  email: "john@gmail.com",
  password: "john"
});

// Ex. Delete record
googapi.sheet("Sheet1").delete({ name: "John Doe" })

// Return object
{ affectedRows: 0, addedRows: 0, records?: [], status: true }
*/

class GoogSheetApi {
  spreadsheetId: string;
  credentials: Credentials;
  config: Config;
  client: any;
  token?: Token;
  gsapi: any;

  constructor(spreadsheetId: string, credentials: Credentials, config: Config) {
    this.spreadsheetId = spreadsheetId;
    this.credentials = credentials;
    this.config = config;

    return this;
  }

  async authorize() {
    try {
      const { client, token } = await googleAuthJWT(this.credentials);
      this.client = client;
      this.token = token;
      return client;
    } catch (err: any) {
      throw err;
    }
  }

  async refreshToken() {
    if (this.token) {
      if (this.token.expiry_date < Date.now() + 10000) {
        const client = await this.authorize();
        this.gsapi = google.sheets({ version: 'v4', auth: client });
      }
    } else {
      // if token is not defined
      const client = await this.authorize();
      this.gsapi = google.sheets({ version: 'v4', auth: client });
    }
    return this.token;
  }

  async findSheets() {
    await this.refreshToken();
    const options = {
      spreadsheetId: this.spreadsheetId,
      includeGridData: false
    };
    const result = await this.gsapi.spreadsheets.get(options);
    return result.data;
  }

  sheet(name: string) {
    const sheet = new Sheet(name, this);
    return sheet;
  }
}

export default GoogSheetApi;

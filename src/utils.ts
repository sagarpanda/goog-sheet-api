const { google } = require('googleapis');

export interface Credentials {
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

export const diff_minutes = (dt2: Date, dt1: Date) => {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
};

export const convertLetterToNumber = (str: string) => {
  let out = 0;
  const len = str.length;
  for (let pos = 0; pos < len; pos++) {
    out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
  }
  return out;
};

export const convertNumberToLetter = (index: number) => {
  return String.fromCharCode(65 + index);
};

// convert values array to object
export const valuesEncoder = (values: any, columns: string[]) => {
  const obj = columns.reduce((prev: any, curr: string, currIndex: number) => {
    const temp = prev;
    temp[curr] = '';
    if (values[currIndex] !== undefined) {
      temp[curr] = values[currIndex];
    }
    return temp;
  }, {});
  return obj;
};

// convert values object to array
export const valuesDecoder = (values: any, columns: string[]) => {
  const arr = columns.map((colName: string) => {
    const value = values[colName] === undefined ? '' : values[colName];
    return value;
  });
  return arr;
};

export const googleAuthJWT = (credentials: Credentials): any => {
  return new Promise((resolve, reject) => {
    const { client_email, private_key } = credentials;
    const client = new google.auth.JWT(client_email, null, private_key, [
      'https://www.googleapis.com/auth/spreadsheets'
    ]);
    client.authorize((error: any, token: any) => {
      if (error) {
        reject(error);
      } else {
        resolve({ client, token });
      }
    });
  });
};

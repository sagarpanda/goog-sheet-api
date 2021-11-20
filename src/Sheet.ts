import { valuesEncoder, valuesDecoder } from './utils';

interface Where {
  [key: string]: string;
}

class Sheet {
  name: string;
  options: any;

  constructor(name: string, options: any) {
    this.name = name;
    this.options = options;

    return this;
  }

  async find(arg: any = {}) {
    await this.options.refreshToken();
    const sheetCols = this.options.config.sheets[this.name];
    if (!sheetCols) {
      throw new Error(`${this.name} is not defined under config.sheets`);
    }
    const skipFirstRow = Boolean(this.options.config.skipFirstRow);

    const options = {
      spreadsheetId: this.options.spreadsheetId,
      range: `${this.name}`
    };
    let records = [];
    try {
      const { data } = await this.options.gsapi.spreadsheets.values.get(options);
      let incIndex = 0;
      if (skipFirstRow && data.values.length > 0) {
        data.values.shift();
        incIndex = 1;
      }
      records = data.values.map((item: any, index: number) => {
        return { ...valuesEncoder(item, sheetCols), rowIndex: index + incIndex };
      });
    } catch (error) {
      throw error;
    }
    // if where clause exist
    if (arg.where) {
      records = records.filter((record: any, index: number) => {
        const bool = Object.entries(arg.where).reduce((prev: boolean, curr: any) => {
          let temp = prev;
          const [key, keyValue] = curr;
          if (prev && record[key] !== keyValue) {
            temp = false;
          }
          return temp;
        }, true);
        return bool;
      });
    }
    return { affectedRows: 0, addedRows: 0, records, status: true };
  }

  async add(record: any) {
    await this.options.refreshToken();
    const sheetCols = this.options.config.sheets[this.name];
    if (!sheetCols) {
      throw new Error(`${this.name} is not defined under config.sheets`);
    }
    const values = valuesDecoder(record, sheetCols);
    const options = {
      spreadsheetId: this.options.spreadsheetId,
      range: this.name,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [values] }
    };
    const result = await this.options.gsapi.spreadsheets.values.append(options);
    return { affectedRows: 0, addedRows: result.data.updates.updatedRows, status: true };
  }

  async update(where: Where, record: any) {
    await this.options.refreshToken();
    const sheetCols = this.options.config.sheets[this.name];
    if (!sheetCols) {
      throw new Error(`${this.name} is not defined under config.sheets`);
    }

    const { records } = await this.find({ where });
    if (records.length === 0) {
      throw new Error('no match found!!!');
    }

    const data = records.map((item: any, index: number) => {
      const range = `${this.name}!A${item.rowIndex + 1}`;
      const modified = { ...item, ...record };
      const arr = valuesDecoder(modified, sheetCols);
      const values = [arr];
      return { range, values };
    });

    const options = {
      spreadsheetId: this.options.spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data
      }
    };

    try {
      const result = await this.options.gsapi.spreadsheets.values.batchUpdate(options);
      return { affectedRows: result.data.totalUpdatedRows, addedRows: 0, status: true };
    } catch (error) {
      throw error;
    }
  }

  async delete(where: Where) {
    await this.options.refreshToken();
    const { sheets } = await this.options.findSheets();
    const mySheet = sheets.filter((item: any) => item.properties.title === this.name)[0];
    if (!mySheet) {
      throw new Error(`${this.name} cound not find`);
    }

    const { records } = await this.find({ where });
    if (records.length === 0) {
      throw new Error('no match found!!!');
    }

    const requests = records.map((item: any, index: number) => {
      const startRowIndex = item.rowIndex - index;
      return {
        deleteRange: {
          range: {
            sheetId: mySheet.properties.sheetId,
            startRowIndex,
            endRowIndex: startRowIndex + 1
          },
          shiftDimension: 'ROWS'
        }
      };
    });

    const options = {
      spreadsheetId: this.options.spreadsheetId,
      resource: { requests }
    };

    try {
      const result = await this.options.gsapi.spreadsheets.batchUpdate(options);
      return { affectedRows: result.data.replies.length, addedRows: 0, status: true };
    } catch (error) {
      throw error;
    }
  }
}

export default Sheet;

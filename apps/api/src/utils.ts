import { google } from 'googleapis';
import creds from '../sheets-api.json';

export const isJSONErrorResponse = (response: Response) => {
  return (
    response.body && response.headers.get('content-type')?.includes('json')
  );
};

export async function exportToSheet(
  sheetId: string,
  range: string,
  values: (string | number | boolean)[][],
) {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  return await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: range,
    valueInputOption: 'RAW',
    requestBody: { values },
    auth,
  });
}

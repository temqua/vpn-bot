import { google } from 'googleapis';
import creds from '../../../sheets-api.json';
export async function exportToSheet(sheetId: string, range: string, values: string[][]) {
	const auth = new google.auth.GoogleAuth({
		credentials: creds,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	});
	const sheets = google.sheets({ version: 'v4', auth });

	await sheets.spreadsheets.values.update({
		spreadsheetId: sheetId,
		range: range,
		valueInputOption: 'RAW',
		requestBody: { values },
		auth,
	});
}

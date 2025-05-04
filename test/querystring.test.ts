import { describe, expect, test } from 'bun:test';
import querystring from 'node:querystring';

describe('Utils testing', () => {
	test('query string test', () => {
		const qs = 'username=artem&email=art_nazarov@mail.ru';
		const parsed = querystring.decode(qs);
		expect(parsed).toMatchSnapshot();
	});
});

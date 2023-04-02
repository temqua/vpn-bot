import { describe, expect, test } from "@jest/globals";
import querystring from 'node:querystring';

describe("Utils testing", () => {
  test("query string test", () => {
    const qs = "username=artem&email=art_nazarov@mail.ru"
    const parsed = querystring.decode(qs)
    console.log('parsed :>> ', parsed);
    expect(parsed).toMatchSnapshot();
  });
});

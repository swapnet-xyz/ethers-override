
import { describe, expect, test } from '@jest/globals';
import { mergeDeep, isObject } from "../src/utils";

describe("utils", () => {

  test("isObject", () => {
    const anObject = {
      "aList": [
        {
          "a": "abcDEFghi",
          "b": [12345, 67890]
        },
        {
          "a": "JKLmno",
          "b": []
        }
      ]
    }
    const aNumber = 10;
    const anArray = ["abc", "def", "ghi"]
    expect(isObject(anObject)).toBe(true);
    expect(isObject(aNumber)).toBe(false);
    expect(isObject(anArray)).toBe(false);
  })

  test("mergeDeep", () => {
    const x = { a: { a: 1 } };
    const y = { a: { b: 1 } };
    const z = mergeDeep(y, x);
    expect(z).toStrictEqual({ a: { a: 1, b: 1 } });
  })
})
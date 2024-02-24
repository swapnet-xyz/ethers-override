import { describe, expect, test } from '@jest/globals';
import { AddressAsIf } from "../src/index";

describe("addressAsIf", () => {

  test("valueAsyncBalance", async () => {
    const address = "0x1231231231231231231231231231231231231231";
    const oldState = new AddressAsIf(address)
    const newState = oldState.balance().is(1234500000n);
    const result = await newState.valueAsync();
    expect(result).toEqual({ [address]: { "balance": "1234500000" } });
  })

  test("valueAsyncStateDiff", async () => {
    const address = "0x1231231231231231231231231231231231231231";
    const slot = "abc";
    const oldState = new AddressAsIf(address)
    const newState = oldState.stateDiff(slot).is("0xAbcdefghi")
    const result = await newState.valueAsync();
    expect(result).toEqual({ [address]: { "stateDiff": { [slot]: "0xAbcdefghi" } } });
  })

})






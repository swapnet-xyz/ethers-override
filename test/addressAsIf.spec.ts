import { beforeEach, describe, expect, test } from '@jest/globals';
import { AddressAsIf } from "../src/index";

describe("addressAsIf", () => {

  test("valueAsyncBalance", async () => {
    const address = "0x1231231231231231231231231231231231231231";
    const oldState = new AddressAsIf(address)
    const newState = oldState.balance().is("1234500000n")
    const result = await newState.valueAsync();
    expect(Object.keys(result)[0]).toBe(address);
    expect(result.address.balance).toBe("1234500000n");
  })

  test("valueAsyncStateDiff", async () => {
    const address = "0x1231231231231231231231231231231231231231";
    const slot = "abc";
    const oldState = new AddressAsIf(address)
    const newState = oldState.stateDiff(slot).is("0xAbcdefghi")
    const result = await newState.valueAsync();
    expect(Object.keys(result)[0]).toBe(address);
    expect(result.address.stateDiff.slot).toBe("0xAbcdefghi");
  })

})






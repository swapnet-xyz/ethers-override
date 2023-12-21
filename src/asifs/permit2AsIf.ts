
import { keccak256, solidityPacked, toBeHex, zeroPadValue } from "ethers";
import { AddressAsIf } from "./addressAsIf";

// import { abi as permit2Abi } from '../abi/permit2.json'
// const permit2Interface: Interface = new Interface(permit2Abi);

const getAllowanceSlotKey = (ownerAddress: string, tokenAddress: string, spenderAddress: string, mappingSlotNumber: number): string => {
    return keccak256(
        zeroPadValue(spenderAddress, 32)
        + keccak256(
            zeroPadValue(tokenAddress, 32)
            + keccak256(
                zeroPadValue(ownerAddress, 32)
                + toBeHex(mappingSlotNumber, 32).slice(2)
            ).slice(2)
        ).slice(2)
    );
}

export type Permit2AllowanceValue = {
    nonce: bigint;
    expiration: bigint;
    amount: bigint;
};

export class Permit2AsIf extends AddressAsIf {
    private _method: "allowance" | undefined = undefined;
    private _allowanceMappingSlotNumber = 1;

    public constructor(address: string) {
        super(address);
    }

    public allowance(ownerAddress: string, tokenAddress: string, spenderAddress: string): Permit2AsIf {
        this._method = "allowance";
        super.stateDiff(getAllowanceSlotKey(ownerAddress, tokenAddress, spenderAddress, this._allowanceMappingSlotNumber));
        return this;
    }

    public is(value: Permit2AllowanceValue): Permit2AsIf {
        if (this._method === undefined) {
            throw new Error(`Method to call of AsIf at ${this.address} is not set!`);
        }

        if (this._method === "allowance") {
            if (
                value === undefined
                || typeof value.amount !== 'bigint'
                || typeof value.expiration !== 'bigint'
                || typeof value.nonce !== 'bigint'
            ) {
                throw new Error(`Invalid value for ${this._method} of Permit2AsIf.`)
            }
            const slotValue = solidityPacked(["uint48", "uint48", "uint160"], [ value.nonce, value.expiration, value.amount ]);
            super.is(slotValue);
        }

        return this;
    }
};

const PERMIT2_ADDRESS = "0x000000000022d473030f116ddee9f6b43ac78ba3";

export const permit2: Permit2AsIf = new Permit2AsIf(PERMIT2_ADDRESS);
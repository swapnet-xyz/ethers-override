
import { BlockTag } from "ethers"
import { EthCallOverride } from "./types";
import { AddressAsIf } from "./addressAsIf";
import { mergeDeep } from "./utils";


export class LedgerState {
    public static from(blockTag: BlockTag): LedgerState {
        return new LedgerState(blockTag);
    }

    public static original: LedgerState = new LedgerState(undefined);

    private readonly _blockTag: BlockTag | undefined;
    private readonly _asIfs: AddressAsIf [] = [];

    public constructor(blockTag: BlockTag | undefined) {
        this._blockTag = blockTag
    }

    public asif(asIf: AddressAsIf): LedgerState {
        this._asIfs.push(asIf);
        return this;
    }

    public async getStateAsync(): Promise<[ BlockTag, EthCallOverride]> {
        if (this._blockTag === undefined) {
            throw new Error(`Failed to call LedgerState.state() as blockTag is not set!`);
        }
        const override = await this.getDiffAsync();
        return [this._blockTag, override];
    }

    public blockTag(): BlockTag {
        if (this._blockTag === undefined) {
            throw new Error(`Failed to call LedgerState.blockTag() as blockTag is not set!`);
        }

        return this._blockTag;
    }

    public async getDiffAsync(): Promise<EthCallOverride> {
        const asIfValues = await Promise.all(this._asIfs.map(asIf => asIf.valueAsync()));

        let override: EthCallOverride = {};
        asIfValues.forEach(asIfValue => {
            override = mergeDeep(override, asIfValue);
        });

        return override;
    }
}
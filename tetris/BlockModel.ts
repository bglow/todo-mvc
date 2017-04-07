import ModelElement from "../src/ModelElement";
export class BlockModel extends ModelElement<any> {

    static SIDE_LENGTH = 25;

    readonly x: ModelElement<number>;
    readonly y: ModelElement<number>;

    constructor(x: number, y: number) {
        super();
        this.x = new ModelElement<number>(x * BlockModel.SIDE_LENGTH);
        this.y = new ModelElement<number>(y * BlockModel.SIDE_LENGTH);
    }
}
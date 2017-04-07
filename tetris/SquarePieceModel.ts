/*
 block arrangement:

 A B
 C D

 where A is anchor
 */
import {PieceModel} from "./PieceModel";
import {BlockModel} from "./BlockModel";
export class SquarePieceModel extends PieceModel {
    constructor(initX: number, initY: number) {
        super();
        this.anchor = new BlockModel(initX, initY);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel(initX + 1, initY));
        this.blocks.push(new BlockModel(initX + 1, initY + 1));
        this.blocks.push(new BlockModel(initX, initY + 1));
    }

    rotate(): void {
        // do nothing. Square piece cannot rotate
    }
}
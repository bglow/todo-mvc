import SVGComponent from "../SVGComponent";
import {PieceModel} from "./PieceModel";
import {BlockModel} from "./BlockModel";
export class Piece {
    readonly blocks: SVGComponent[];

    protected static COLORS = ['#FFAA55','#AAFF55','#AA55FF','#FF55AA','#55FFAA','#55AAFF'];

    static randomColor(): string {
        return Piece.COLORS[Math.floor((Math.random() * (Piece.COLORS.length)))];
    }

    constructor(pieceModel: PieceModel) {
        this.blocks = [];
        let color = Piece.randomColor();
        for (let blockModel of pieceModel.blocks) {
            let blockComponent = new SVGComponent("rect")
                .withAttribute("x", blockModel.x)
                .withAttribute("y", blockModel.y)
                .withAttribute("width", BlockModel.SIDE_LENGTH)
                .withAttribute("height", BlockModel.SIDE_LENGTH)
                .withAttribute("style","stroke: #000000; fill: " + color + ";")
                .reinit();
            blockModel.bindComponent(blockComponent);
            this.blocks.push(blockComponent);
        }
    }

}
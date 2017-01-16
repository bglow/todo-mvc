import {BlockModel} from "./BlockModel";
import {Direction, gameWidth, gameHeight} from "./shared";
import {Tetris} from "./tetris";

export abstract class PieceModel {
    protected anchor: BlockModel;
    readonly blocks: BlockModel[] = [];

    rotate(): void {

        type Move = { block: BlockModel, x: number, y: number };

        // return false if rotation would move a block outside of the gameboard
        function rotateBlockClockwise(acc: Array<Move>, anchor: BlockModel, block: BlockModel): boolean {
            let dy = block.y.get() - anchor.y.get();
            let dx = block.x.get() - anchor.x.get();
            let move: Move = {
                block: block,
                x: anchor.x.get() + dy,
                y: anchor.y.get() - dx
            };
            acc.push(move);
            return move.x >= 0 && (move.x < gameWidth * BlockModel.SIDE_LENGTH);
        }

        let moves: Array<Move> = [];
        for (let block of this.blocks) {
            if(!rotateBlockClockwise(moves, this.anchor, block))
                return;
        }

        for (let move of moves) {
            move.block.x.set(move.x);
            move.block.y.set(move.y);
        }
    }

    // returns true if the move was valid
    move(tetris: Tetris, direction: Direction): boolean {
        let validMove = false;
        let grouped: {x: {[n: number]: BlockModel[]}, y: {[n: number]: BlockModel[]}} = {
            x: {},
            y: {}
        };
        for (let block of this.blocks) {
            let x = block.x.get();
            if (!grouped.x[x])
                grouped.x[x] = [];
            grouped.x[x].push(block);
            let y = block.y.get();
            if (!grouped.y[y])
                grouped.y[y] = [];
            grouped.y[y].push(block);
        }
        outter:
        switch (direction) {
            case Direction.LEFT:
                if (grouped.x[0] == undefined) {
                    for (let block of this.blocks) {
                        let currentLine = tetris.lines[block.y.get()];
                        if (currentLine && currentLine.blocks[block.x.get() - BlockModel.SIDE_LENGTH])
                            break outter;
                    }
                    for (let block of this.blocks)
                        block.x.set(block.x.get() - BlockModel.SIDE_LENGTH);
                    validMove = true;
                }
                break;
            case Direction.RIGHT:
                if (grouped.x[(BlockModel.SIDE_LENGTH * gameWidth) - BlockModel.SIDE_LENGTH] == undefined) {
                    for (let block of this.blocks) {
                        let currentLine = tetris.lines[block.y.get()];
                        if (currentLine && currentLine.blocks[block.x.get() + BlockModel.SIDE_LENGTH])
                            break outter;
                    }
                    for (let block of this.blocks)
                        block.x.set(block.x.get() + BlockModel.SIDE_LENGTH);
                    validMove = true;
                }
                break;
            case Direction.DOWN:
                if (grouped.y[(BlockModel.SIDE_LENGTH * gameHeight) - BlockModel.SIDE_LENGTH] == undefined) {
                    for (let block of this.blocks) {
                        let lineBelow = tetris.lines[block.y.get() + BlockModel.SIDE_LENGTH];
                        if (lineBelow && lineBelow.blocks[block.x.get()])
                            break outter;
                    }
                    for (let block of this.blocks)
                        block.y.set(block.y.get() + BlockModel.SIDE_LENGTH);
                    validMove = true;
                }
                break;
            case (Direction.AUTO_DOWN):
                while((this.move(tetris, Direction.DOWN))) {}
                break;
        }

        return validMove;
    }

}
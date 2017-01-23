import {CanvasFunction} from "./CanvasFunction";
export class Time {

    protected frameLength: number;

    readonly canvasFunctions = new Set<CanvasFunction>();

    constructor(frameLength: number) {
        this.frameLength = frameLength;
    }

}
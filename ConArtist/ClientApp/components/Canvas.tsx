import * as React from 'react';
import './Canvas.css';

export interface Player {
    color: string;
}

export interface Point {
    X: number;
    Y: number;
}

export interface Line {
    points: Point[];
    player: Player;
}

interface CanvasProps {
    lines: Line[];
    drawingPlayer?: Player;
    lineDrawn?: (points: Point[]) => void;
}

interface CanvasState {
    width: number;
    height: number;
    isDrawing: boolean;
    drawingLine?: Line;
}

export class Canvas extends React.PureComponent<CanvasProps, CanvasState> {
    private ctx: CanvasRenderingContext2D;
    private wrapper: HTMLDivElement;
    private resizeListener?: () => void;

    constructor(props: CanvasProps) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            isDrawing: false,
        };
    }

    public componentDidMount() {
        this.resizeListener = () => this.updateSize();
        window.addEventListener('resize', this.resizeListener);

        this.updateSize();
    }

    public componentWillUnmount() {
        if (this.resizeListener !== undefined) {
            window.removeEventListener('resize', this.resizeListener);
        }
    }

    shouldComponentUpdate(nextProps: CanvasProps, nextState: CanvasState) {
        if (nextState.width === this.state.width
            && nextState.height === this.state.height
            && nextProps.drawingPlayer === this.props.drawingPlayer
            && nextProps.lineDrawn === this.props.lineDrawn) {

            // if only lines have changed, don't rerender the component, just redraw the canvas
            this.redraw();
            return false;
        }

        return true;
    }

    public componentDidUpdate() {
        this.redraw();
    }

    public render() {
        if (this.props.drawingPlayer === undefined) {
            return this.renderFixed();
        }
        else {
            return this.renderDrawable();
        }
    }

    private renderFixed() {
        return <div className="canvas" ref={w => { if (w !== null) { this.wrapper = w } }}>
            {this.renderCanvas()}
        </div>;
    }

    private renderDrawable() {
        return <div
            className="canvas"
            ref={w => { if (w !== null) { this.wrapper = w } }}
            onMouseDownCapture={e => this.mouseDown(e)}
            onMouseUpCapture={e => this.mouseUp(e)}
            onMouseMoveCapture={e => this.mouseMove(e)}
        >
            {this.renderCanvas()}
        </div>;
    }

    private renderCanvas() {
        return <canvas
            ref={c => { if (c !== null) { this.ctx = c.getContext('2d') as CanvasRenderingContext2D } }}
            className="canvas__element"
            width={this.state.width}
            height={this.state.height}
        />;
    }

    private updateSize() {
        this.setState({
            width: this.wrapper.offsetWidth,
            height: this.wrapper.offsetHeight,
        });
    }

    private redraw() {
        this.drawCanvas(this.ctx, this.state.width, this.state.height);
    }

    private drawCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = Math.min(width, height) / 25;

        for (let line of this.props.lines) {
            this.drawLine(line, ctx, width, height);
        }

        if (this.state.drawingLine !== undefined) {
            this.drawLine(this.state.drawingLine, ctx, width, height);
        }
    }

    private drawLine(line: Line, ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.strokeStyle = line.player.color;
        ctx.beginPath();

        let first = true;
        for (let point of line.points) {
            let x = point.X * width;
            let y = point.Y * height;

            if (first) {
                first = false;
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    private getScaledPoint(e: React.MouseEvent<HTMLDivElement>): Point {
        let target = e.target as HTMLDivElement;

        return {
            X: (e.pageX - target.offsetLeft) / target.offsetWidth,
            Y: (e.pageY - target.offsetTop) / target.offsetHeight,
        }
    }

    private mouseDown(e: React.MouseEvent<HTMLDivElement>) {
        if (e.button !== 0 || this.state.isDrawing || this.props.drawingPlayer === undefined) {
            return;
        }

        let line: Line = {
            player: this.props.drawingPlayer,
            points: [this.getScaledPoint(e)],
        };

        this.setState({
            drawingLine: line,
            isDrawing: true,
        })
    }

    private mouseUp(e: React.MouseEvent<HTMLDivElement>) {
        if (e.button !== 0 || !this.state.isDrawing || this.state.drawingLine === undefined) {
            return;
        }

        if (this.props.lineDrawn !== undefined) {
            this.props.lineDrawn(this.state.drawingLine.points);
        }

        this.setState({
            isDrawing: false,
        });
    }

    private mouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.state.isDrawing || this.state.drawingLine === undefined) {
            return;
        }

        // don't add a point on EVERY mouseMove event... only do so if we've moved at least 5px from the previous point
        let newPoint = this.getScaledPoint(e);

        let lastPoint = this.state.drawingLine.points[this.state.drawingLine.points.length - 1];
        if (this.distSq(newPoint, lastPoint) < 25) {
            return;
        }

        this.setState(state => this.appendPoint(state, newPoint));
    }

    private appendPoint(state: CanvasState, newPoint: Point): Pick<CanvasState, never> {
        if (state.drawingLine === undefined) {
            return {};
        }

        let points = state.drawingLine.points;
        points.push(newPoint);

        let line: Line = {
            player: state.drawingLine.player,
            points: points,
        };

        return {
            drawingLine: line,
        };
    }

    private distSq(p1: Point, p2: Point) {
        let dx = p1.X - p2.X;
        let dy = p1.Y - p2.Y;

        return dx * dx + dy * dy;
    }
}
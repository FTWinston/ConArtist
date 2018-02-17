import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as GameStore from '../store/Game';
import { ViewMode } from '../store/Game';
import { Canvas } from './Canvas';
import { PlayerList } from './PlayerList';
import './Game.css';

type GameProps =
    GameStore.GameState
    & typeof GameStore.actionCreators
    & RouteComponentProps<{ gameID: string }>;

class Game extends React.Component<GameProps, {}> {
    public render() {
        if (this.props.viewMode === ViewMode.NotConnected) {
            return <Redirect to={`/game/${this.props.match.params.gameID}/join`} />
        }

        if (this.props.expandDrawing !== undefined) {
            let canDraw = this.props.viewMode === ViewMode.DrawLine;
            return <div className="game game--expanded">
                {this.renderDrawing(this.props.expandDrawing, canDraw)}
            </div>
        }
        
        return <div className="game">
            <PlayerList players={this.props.allPlayers} busyPlayers={this.props.waitingForPlayers} localPlayer={this.props.localPlayer} />
            <div className="game__drawings">
                {this.props.drawings.map(d => this.renderDrawing(d, false))}
            </div>
        </div>;
    }
    
    private renderDrawing(drawing: GameStore.Drawing, canDraw: boolean) {
        return <div className="game__drawing">
            <div className="game__drawing__clue">{drawing.clue}</div>
            <Canvas lines={drawing.lines} drawingPlayer={canDraw ? this.props.localPlayer : undefined} />;
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.game,
    GameStore.actionCreators
)(Game) as typeof Game;

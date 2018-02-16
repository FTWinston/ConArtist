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
        
        return <div className="game">
            <PlayerList players={this.props.allPlayers} busyPlayers={this.props.waitingFor} localPlayer={this.props.localPlayer} />
            {this.renderDrawings()}
        </div>;
    }

    private renderDrawings() {
        if (this.props.expandDrawing !== undefined) {
            return <div className="game__drawings">
                {this.renderDrawing(this.props.expandDrawing, true)}
            </div>
        }
        else {
            return <div className="game__drawings">
                {this.props.drawings.map(d => this.renderDrawing(d, false))}
            </div>
        }
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

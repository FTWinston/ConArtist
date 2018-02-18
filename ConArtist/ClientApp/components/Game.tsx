import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as GameStore from '../store/Game';
import { ViewMode } from '../store/Game';
import { Canvas } from './Canvas';
import { PlayerList } from './PlayerList';
import { DrawingSetup } from './DrawingSetup';
import './Game.css';

type GameProps =
    GameStore.GameState
    & typeof GameStore.actionCreators
    & RouteComponentProps<{ gameID: string }>;

class Game extends React.Component<GameProps, {}> {
    public render() {
        switch (this.props.viewMode) {
            case ViewMode.NotConnected:
                return <Redirect to={`/game/${this.props.match.params.gameID}/join`} />

            case ViewMode.Open:
                return (
                    <div className="game">
                        {this.renderPlayerList}
                        {this.renderStartButton('Once everyone\'s in the game, click to start it', 'Start game')}
                    </div>
                );

            case ViewMode.Idle:
                if (this.props.expandDrawing !== undefined) {
                    return (
                        <div className="game game--expanded">
                            {this.renderExpandedDrawing(false)}
                        </div>
                    );
                }

                return (
                    <div className="game">
                        {this.renderPlayerList(false, false)}
                        {this.renderAllDrawings()}
                    </div>
                );

            case ViewMode.SetupDrawing:
                return <DrawingSetup setupDrawing={(subject, clue,) => this.props.specifyDrawing(subject, clue)} />

            case ViewMode.DrawLine:
                return (
                    <div className="game game--expanded">
                        {this.renderExpandedDrawing(true)}
                    </div>
                );

            case ViewMode.Vote:
                return (
                    <div className="game">
                        {this.renderPlayerList(true, false)}
                        {this.renderExpandedDrawing(false)}
                    </div>
                );

            case ViewMode.VoteResults:
                return (
                    <div className="game">
                        {this.renderPlayerList(false, true)}
                        {this.renderExpandedDrawing(false)}
                    </div>
                );

            case ViewMode.EndGame:
                if (this.props.expandDrawing !== undefined) {
                    return this.renderExpandedDrawing(false);
                }

                return (
                    <div className="game">
                        {this.renderPlayerList(false, true)}
                        {this.renderStartButton('To play again with the same players & settings, click below', 'Play again')}
                        {this.renderAllDrawings()}
                    </div>
                );

            default:
                return <div className="game" />
        }
    }

    private renderPlayerList(vote: boolean, showScore: boolean) {
        // TODO: actually use parameters
        return (
            <PlayerList
                players={this.props.allPlayers}
                busyPlayers={this.props.waitingForPlayers}
                localPlayer={this.props.localPlayer}
            />
        );
    }

    private renderAllDrawings() {
        return (
            <div className="game__drawings">
                {this.props.drawings.map(d => this.renderDrawing(d, false))}
            </div>
        );
    }

    private renderExpandedDrawing(canDraw: boolean) {
        if (this.props.expandDrawing === undefined) {
            return <div />
        }

        return this.renderDrawing(this.props.expandDrawing, canDraw);
    }

    private renderDrawing(drawing: GameStore.Drawing, canDraw: boolean) {
        let description = [
            <div key="clue" className="drawing__clue">{drawing.clue}</div>
        ];

        if (drawing.subject != undefined) {
            description.unshift(<div key="subject" className="drawing__subject">{drawing.subject}</div>)
        }

        return (
            <div className="drawing">
                <div className="drawing__description">{description}</div>
                <Canvas lines={drawing.lines} drawingPlayer={canDraw ? this.props.localPlayer : undefined} />;
            </div>
        );
    }

    private renderStartButton(prompt: string, text: string) {
        return (
            <div className="game__buttonPrompt">
                <p>{prompt}</p>
                <button type="button" className="game_button" onClick={() => this.props.startGame()}>{text}</button>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.game,
    GameStore.actionCreators
)(Game) as typeof Game;

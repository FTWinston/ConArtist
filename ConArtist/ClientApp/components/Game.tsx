import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as GameStore from '../store/Game';
import { ViewMode } from '../store/Game';

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
            TODO: display game
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.game,
    GameStore.actionCreators
)(Game) as typeof Game;

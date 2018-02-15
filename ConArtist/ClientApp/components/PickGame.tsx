import * as React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as GameStore from '../store/Game';

interface PickState {
    gameID: string;
}

type PickProps =
    typeof GameStore.actionCreators
    & RouteComponentProps<{}>;

class PickGame extends React.Component<PickProps, PickState> {
    constructor(props: PickProps) {
        super(props);

        this.state = {
            gameID: '',
        };
    }
    public render() {
        return <form onSubmit={e => { this.joinGame(); e.preventDefault(); }}>
            <h1>Join a game</h1>
            <div>
                <p>Game identifier</p>
                <input
                    type="text"
                    value={this.state.gameID}
                    onChange={e => this.setState({ gameID: e.target.value })}
                />
            </div>

            <input type="submit" value="Join game" disabled={this.state.gameID.trim() === ''} />
        </form>;
    }

    private joinGame() {
        let gameID = this.state.gameID.trim();
        this.props.history.push(`/game/${gameID}/join`);
    }
}

export default connect(
    (state: ApplicationState) => { return {} as PickProps },
    GameStore.actionCreators
)(PickGame) as typeof PickGame;

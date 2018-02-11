import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface PickState {
    gameID: string;
}

export default class PickGame extends React.Component<RouteComponentProps<{}>, PickState> {
    constructor(props: RouteComponentProps<{}>) {
        super(props);

        this.state = {
            gameID: '',
        };
    }
    public render() {
        return <form onSubmit={e => { this.joinGame(); e.preventDefault(); }}>
            <h1>Join a game</h1>
            <div>
                <p>Number of drawings</p>
                <input
                    type="text"
                    value={this.state.gameID}
                    onChange={e => this.setState({ gameID: e.target.value })}
                />
            </div>

            <input type="submit" value="Join game" disabled={this.state.gameID === ''} />
        </form>;
    }

    private joinGame() {
        // TODO: send signalR message, navigate to /game/{this.state.gameID}/join
    }
}

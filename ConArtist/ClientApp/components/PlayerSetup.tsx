import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface PlayerSetupState {
    name: string;
    color?: number;
}

export default class PlayerSetup extends React.Component<RouteComponentProps<{}>, PlayerSetupState> {
    constructor(props: RouteComponentProps<{}>) {
        super(props);

        this.state = {
            name: '',
            color: undefined,
        };
    }
    public render() {
        return <form onSubmit={e => { this.joinGame(); e.preventDefault(); }}>
            <h1>Join a game</h1>
            <div>
                <p>Your name</p>
                <input
                    type="text"
                    value={this.state.name}
                    onChange={e => this.setState({ name: e.target.value })}
                />
            </div>
            <div>
                <p>Drawing color</p>
                <p>...</p>
            </div>

            <input
                type="submit"
                value="Join game"
                disabled={this.state.name === '' || this.state.color === undefined}
            />
            <input type="button" value="Spectate" onClick={() => this.spectate()} />
        </form>;
    }

    private joinGame() {
        // TODO: send signalR message, navigate to /game/{this.state.gameID}/join
    }

    private spectate() {
        // TODO: navigate to /game/gameID
    }
}

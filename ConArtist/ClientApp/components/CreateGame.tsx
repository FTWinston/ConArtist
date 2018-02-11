import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface CreateState {
    numDrawings: number;
    numLines: number;
    canChoose: boolean;
}

export default class CreateGame extends React.Component<RouteComponentProps<{}>, CreateState> {
    constructor(props: RouteComponentProps<{}>) {
        super(props);

        this.state = {
            numDrawings: 1,
            numLines: 2,
            canChoose: false,
        };
    }
    public render() {
        return <form onSubmit={e => { this.createGame(); e.preventDefault(); } }>
            <h1>Create a game</h1>
            <p>
                You can customise some game settings if you want, but the defaults are good for new players.
            </p>

            <div>
                <p>Number of drawings</p>
                <input
                    type="number"
                    min="1"
                    value={this.state.numDrawings}
                    onChange={e => this.setState({ numDrawings: e.target.valueAsNumber })}
                />
            </div>

            <div>
                <p>Number of lines each player gets to draw</p>

                <input
                    type="number"
                    min="1"
                    max="10"
                    value={this.state.numLines}
                    onChange={e => this.setState({ numLines: e.target.valueAsNumber })}
                />
            </div>

            <div>
                <p>Commisioner can choose imposter</p>
                <input
                    type="checkbox"
                    checked={this.state.canChoose}
                    onChange={e => this.setState({ canChoose: e.target.checked })}
                />
            </div>

            <input type="submit" value="Create game" />
        </form>;
    }

    private createGame() {
        // TODO: send signalR message, get game ID, then navigate to /game/id/join
    }
}

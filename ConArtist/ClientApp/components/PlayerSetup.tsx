import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as GameStore from '../store/Game';
import { ViewMode } from '../store/Game';

type PlayerSetupProps =
    GameStore.GameState
    & typeof GameStore.actionCreators
    & RouteComponentProps<{ gameID: string }>;

interface PlayerSetupState {
    name: string;
    color?: number;
}

class PlayerSetup extends React.Component<PlayerSetupProps, PlayerSetupState> {
    constructor(props: PlayerSetupProps) {
        super(props);

        this.state = {
            name: '',
            color: undefined,
        };
    }

    componentWillMount() {
        if (this.props.viewMode === ViewMode.NotConnected) {
            this.props.connect(this.props.match.params.gameID);
        }
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

            {this.renderColorSelection()}

            <input
                type="submit"
                value="Join game"
                disabled={this.state.name === '' || this.state.color === undefined}
            />
            <input type="button" value="Spectate" onClick={() => this.spectate()} />
        </form>;
    }

    private renderColorSelection() {
        let disabledColors = this.props.allPlayers
            .filter(p => p !== this.props.localPlayer)
            .map(p => p.color);

        return <div>
            <p>Drawing color</p>
            {this.renderColorRadio(1, 'Red', disabledColors)}
            {this.renderColorRadio(2, 'Orange', disabledColors)}
            {this.renderColorRadio(3, 'Yellow', disabledColors)}
            {this.renderColorRadio(4, 'Light Green', disabledColors)}
            {this.renderColorRadio(5, 'Dark Green', disabledColors)}
            {this.renderColorRadio(6, 'Light Blue', disabledColors)}
            {this.renderColorRadio(7, 'Deep Blue', disabledColors)}
            {this.renderColorRadio(8, 'Violet', disabledColors)}
        </div>
    }

    private renderColorRadio(value: number, name: string, disabledValues: number[]) {
        let disabled = disabledValues.indexOf(value) !== -1;
        let checked = this.state.color === value && !disabled;
        let classes = 'btn btn-primary';
        if (disabled) {
            classes += ' btn-disabled';
        }
        if (checked) {
            classes += ' active';
        }

        return (
        <label className={classes}>
            <input type="radio" name="color" value={value} checked={checked} disabled={disabled} onChange={e => this.setState({ color: value })} />
            {name}
        </label>
        );
    }

    private joinGame() {
        if (this.state.color === undefined) {
            return;
        }

        this.props.joinGame(this.state.name, this.state.color);
        this.props.history.push(`/game/${this.props.match.params.gameID}`); // TODO: this should happen automatically, on success
    }

    private spectate() {
        this.props.history.push(`/game/${this.props.match.params.gameID}`);
    }
}

export default connect(
    (state: ApplicationState) => state.game,
    GameStore.actionCreators
)(PlayerSetup) as typeof PlayerSetup;

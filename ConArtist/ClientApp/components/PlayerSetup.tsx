import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as GameStore from '../store/Game';
import { ViewMode } from '../store/Game';
import { getColorInfo } from '../Colors';

type PlayerSetupProps =
    GameStore.GameState
    & typeof GameStore.actionCreators
    & RouteComponentProps<{ gameID: string }>;

interface PlayerSetupState {
    name: string;
    color: number;
}

class PlayerSetup extends React.Component<PlayerSetupProps, PlayerSetupState> {
    constructor(props: PlayerSetupProps) {
        super(props);

        this.state = {
            name: '',
            color: -1,
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
                disabled={!this.isAllowedToJoin()}
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
            {this.renderColorRadio(1, disabledColors)}
            {this.renderColorRadio(2, disabledColors)}
            {this.renderColorRadio(3, disabledColors)}
            {this.renderColorRadio(4, disabledColors)}
            {this.renderColorRadio(5, disabledColors)}
            {this.renderColorRadio(6, disabledColors)}
            {this.renderColorRadio(7, disabledColors)}
            {this.renderColorRadio(8, disabledColors)}
        </div>
    }

    private renderColorRadio(value: number, disabledValues: number[]) {
        let disabled = disabledValues.indexOf(value) !== -1;
        let checked = this.state.color === value && !disabled;

        let classes = 'btn btn-primary';
        if (disabled) {
            classes += ' btn-disabled';
        }
        if (checked) {
            classes += ' active';
        }

        let color = getColorInfo(value);

        return (
        <label className={classes} style={{ backgroundColor: color.style }}>
            <input type="radio" name="color" value={value} checked={checked} disabled={disabled} onChange={e => this.setState({ color: value })} />
            {color.name}
        </label>
        );
    }

    private isAllowedToJoin() {
        // name & color should be present
        let name = this.state.name.trim();
        if (name.length === 0 || this.state.color === -1) {
            return false;
        }

        // name and color shouldn't be used by any other player
        if (this.props.allPlayers.filter(p => p.name === name || p.color === this.state.color).length > 0) {
            return false;
        }

        return true;
    }

    private joinGame() {
        this.props.joinGame(this.state.name, this.state.color);
    }

    private spectate() {
        this.props.history.push(`/game/${this.props.match.params.gameID}`);
    }
}

export default connect(
    (state: ApplicationState) => state.game,
    GameStore.actionCreators
)(PlayerSetup) as typeof PlayerSetup;

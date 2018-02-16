import * as React from 'react';
import { PlayerInfo } from '../store/Game';
import { getColorInfo } from '../Colors';
import { PlayerListItem, PlayerListItemProps } from './PlayerListItem';
import './PlayerList.css';

interface PlayerListProps {
    players: PlayerInfo[];
    busyPlayers: PlayerInfo[];
    localPlayer?: PlayerInfo;
}

export class PlayerList extends React.PureComponent<PlayerListProps, {}> {
    public render() {
        let playerList = this.consolidatePlayers();
        return <div className="playerList">
            {playerList.map((p, id) => <PlayerListItem key={id} name={p.name} color={p.color} inactive={p.inactive} isLocal={p.isLocal} />)}
        </div>;
    }

    private consolidatePlayers(): PlayerListItemProps[] {
        return this.props.players.map(p => {
            return {
                name: p.name,
                color: p.color,
                isLocal: p === this.props.localPlayer,
                inactive: this.props.busyPlayers.indexOf(p) === -1,
            }
        });
    }
}

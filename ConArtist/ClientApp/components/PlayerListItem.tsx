import * as React from 'react';
import { PlayerInfo } from '../store/Game';
import { getColorInfo } from '../Colors';

export interface PlayerListItemProps {
    name: string;
    color: number;
    isLocal: boolean;
    inactive: boolean;
}

export class PlayerListItem extends React.PureComponent<PlayerListItemProps, {}> {
    public render() {
        let classes = 'playerListItem';
        if (this.props.inactive) {
            classes += ' playerListItem--inactive';
        }
        if (this.props.isLocal) {
            classes += ' playerListItem--local';
        }

        let color = getColorInfo(this.props.color);

        return <div className={classes}>
            <div className="playerListItem__color" style={{ backgroundColor: color.style }} title={color.name}></div>
            <div className="playerListItem__name">{this.props.name}</div>
        </div>
    }
}

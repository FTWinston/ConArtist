import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as GameStore from '../store/Game';

interface DrawingSetupProps {
    setupDrawing: (subject: string, clue: string) => void;
}

interface DrawingSetupState {
    subject: string;
    clue: string;
}

export class DrawingSetup extends React.Component<DrawingSetupProps, DrawingSetupState> {
    constructor(props: DrawingSetupProps) {
        super(props);

        this.state = {
            subject: '',
            clue: '',
        };
    }

    // TODO: allow selecting imposter... if setup allows it
    public render() {
        return <form className="game--setup" onSubmit={e => { this.props.setupDrawing(this.state.subject, this.state.clue); e.preventDefault(); }}>
            <h1>Setup a drawing</h1>
            <p>
                Enter a subject to be shown to everyone except the imposter, and a clue or category to help the imposter work it out
            </p>

            <div>
                <p>Subject</p>
                <input
                    type="text"
                    value={this.state.subject}
                    onChange={e => this.setState({ subject: e.target.value })}
                />
            </div>

            <div>
                <p>Clue</p>
                <input
                    type="text"
                    value={this.state.clue}
                    onChange={e => this.setState({ clue: e.target.value })}
                />
            </div>

            <input type="submit" value="Setup drawing" />
        </form>
    }
}
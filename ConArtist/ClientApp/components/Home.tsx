import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default class Home extends React.Component<RouteComponentProps<{}>, {}> {
    public render() {
        return <div>
            <h1>Con Artist</h1>
            <p>
                Con artist is a drawing game for 5+ people.
                One player <em>commissions</em> a drawing from the others, who take turns to add <em>one line</em> to the picture.
                But one of those players is an <em>imposter</em>, who doesn't know what they're meant to be drawing.
                Will the other players find out who the imposter is? Or will they <em>con</em> their peers into thinking they're a real <em>artist</em>?
            </p>
            <p>
                Con Artist is based on <em>A Fake Artist Goes to New York</em>, with the option of having multiple drawings on the go simultaneously.
            </p>

            <Link className='bigButton' to={'/create'}>Create a game</Link>
            <Link className='bigButton' to={'/join'}>Join a game</Link>
        </div>;
    }
}

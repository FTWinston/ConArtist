import * as React from 'react';
import { Route } from 'react-router-dom';
import Home from './components/Home';
import CreateGame from './components/CreateGame';
import PickGame from './components/PickGame';
import PlayerSetup from './components/PlayerSetup';
import Game from './components/Game';

export const routes = <div className="fullScreen">
    <Route exact path='/' component={ Home } />
    <Route path='/create' component={CreateGame} />
    <Route path='/join' component={PickGame} />
    <Route path='/game/:gameID' component={Game} exact />
    <Route path='/game/:gameID/join' component={PlayerSetup} />
</div>;

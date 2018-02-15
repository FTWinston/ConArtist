import * as signalR from '@aspnet/signalr-client';
import { ApplicationState } from './store';
import { Action, Middleware, Store } from 'redux';
import { push } from 'react-router-redux';
import { actionCreators, CreateAction, ConnectAction, JoinGameAction, SetupDrawingAction, AddLineAction, VoteAction, PlayerInfo, Point, ViewMode } from './store/Game';

let connection = new signalR.HubConnection(
    new signalR.HttpConnection(typeof (document) === 'undefined' ? 'http://conartist.ftwinston.com/live' : `http://${document.location.host}/live`, {
        transport: signalR.TransportType.WebSockets
    })
);

export const signalrMiddleware: Middleware = store => next => async <A extends Action>(action: A) => {
    switch (action.type) {
        case 'CLIENT_CREATE_GAME':
            if ((store.getState() as any as ApplicationState).game.viewMode !== ViewMode.NotConnected) {
                console.error('Cannot create game when already connected to another game');
                break;
            }
            let createAction = action as Action as CreateAction;
            connection.invoke('CreateGame' , createAction.numSimultaneousDrawings , createAction.numDrawSteps, createAction.canChoose)
                .then(gameID => store.dispatch(push(`/game/${gameID}/join`)));
            break;

        case 'CLIENT_CONNECT_GAME':
            if ((store.getState() as any as ApplicationState).game.viewMode !== ViewMode.NotConnected) {
                console.error('Cannot connect to a game when already connected to another game');
                break;
            }
            let connectAction = action as Action as ConnectAction;
            connection.invoke('ConnectToGame', connectAction.gameID)
                .then(() => store.dispatch(push(`/game/${connectAction.gameID}/join`)));
            break;

        case 'CLIENT_JOIN_GAME':
            let joinAction = action as Action as JoinGameAction;
            connection.invoke('JoinGame', joinAction.name, joinAction.color).then(playerID => store.dispatch(actionCreators.setLocalPlayer(playerID)));

        case 'CLIENT_SETUP_DRAWING':
            let setupAction = action as Action as SetupDrawingAction
            connection.invoke('SetupDrawing', setupAction.subject, setupAction.clue, setupAction.imposterPlayerID);
            break;

        case 'CLIENT_DRAW_LINE':
            let addAction = action as Action as AddLineAction;
            connection.invoke('AddLine', addAction.drawingID, addAction.points);
            break;

        case 'CLIENT_VOTE':
            let voteAction = action as Action as VoteAction;
            connection.invoke('Vote', voteAction.drawingID, voteAction.suspectPlayerID);
            break;
    }

    return next(action);
};

export function signalrRegisterCommands(store: Store<ApplicationState>, callback: Function) {
    connection.on('ListPlayers', (players: PlayerInfo[]) => store.dispatch(actionCreators.listPlayers(players)));

    connection.on('WaitingForPlayers', (ids: number[]) => store.dispatch(actionCreators.waitingFor(ids)));

    connection.on('StartGame', () => store.dispatch(actionCreators.startGame()));

    connection.on('PromptSetupDrawing', () => store.dispatch(actionCreators.showDrawingSetup()));

    connection.on('PromptDraw', (drawingID: number) => store.dispatch(actionCreators.showDraw(drawingID)));

    connection.on('AddLine', (playerID: number, drawingID: number, points: Point[]) => store.dispatch(actionCreators.addLine(playerID, drawingID, points)));

    connection.on('PromptVote', (drawingID: number) => store.dispatch(actionCreators.showVote(drawingID)));

    connection.on('IndicateVoted', (playerID: number) => store.dispatch(actionCreators.indicateVoted(playerID)));

    connection.on('ShowVoteResult', (drawingID: number, playerIDs: number[], votes: number[]) => store.dispatch(actionCreators.showVoteResult(drawingID, playerIDs, votes)));

    connection.on('ShowEndGame', (playerIDs: number[], scores: number[]) => store.dispatch(actionCreators.showEndGame(playerIDs, scores)));

    connection.start().then(callback());
}
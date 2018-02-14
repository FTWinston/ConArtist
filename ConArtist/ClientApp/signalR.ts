import * as signalR from '@aspnet/signalr-client';
import { ApplicationState } from './store';
import { Action, Middleware, Store } from 'redux';
import { push } from 'react-router-redux';
import { actionCreators, CreateAction, ConnectAction, JoinGameAction, PlayerInfo } from './store/Game';

let connection = new signalR.HubConnection(
    new signalR.HttpConnection(`http://${document.location.host}/live`, {
        transport: signalR.TransportType.WebSockets
    })
);

export const signalrMiddleware: Middleware = store => next => async <A extends Action>(action: A) => {
    switch (action.type) {
        case 'CREATE_GAME':
            if ((store.getState() as any as ApplicationState).game.connected) {
                console.error('Cannot create game when already connected to another game');
                break;
            }
            let createAction = action as Action as CreateAction;
            connection.start()
                .then(() => connection.invoke('CreateGame'
                            , createAction.numSimultaneousDrawings
                            , createAction.numDrawSteps
                            , createAction.canChoose)
                    .then(gameID => push(`/game/${gameID}/join`))
                );
            break;

        case 'CONNECT_GAME':
            if ((store.getState() as any as ApplicationState).game.connected) {
                console.error('Cannot connect to a game when already connected to another game');
                break;
            }
            let connectAction = action as Action as ConnectAction;
            connection.start()
                .then(() => connection
                    .invoke('ConnectToGame', connectAction.gameID)
                    .then(() => push(`/game/${connectAction.gameID}/join`))
                );
            break;

        case 'JOIN_GAME':
            let joinAction = action as Action as JoinGameAction;
            connection.invoke('JoinGame', joinAction.name, joinAction.color).then(playerID => store.dispatch(actionCreators.setLocalPlayer(playerID)));

        /*
        case 'SETUP_DRAWING':
            // subject: string, clue: string, imposterPlayerID?: number
            connection.invoke('SetupDrawing', subject, clue, imposterPlayerID);
            break;

        case 'ADD_LINE': 
            // drawingID: number, points: Point[]
            connection.invoke('AddLine', drawingID, points);
            break;

        case 'VOTE':
            //drawingID: number, suspectPlayerID: number
            connection.invoke('DrawLine', drawingID, suspectPlayerID);
            break;
        */
    }

    return next(action);
};

export function signalrRegisterCommands(store: Store<ApplicationState>, callback: Function) {
    connection.on('ListPlayers', (players: PlayerInfo[]) => store.dispatch(actionCreators.listPlayers(players)));

    connection.on('WaitingForPlayers', (ids: number[]) => store.dispatch(actionCreators.waitingFor(ids)));
/*
    connection.on('StartGame', () => store.dispatch(actionCreators.startGame()));

    connection.on('PromptSetupDrawing', () => store.dispatch(actionCreators.showSetupDrawing()));

    connection.on('PromptDraw', (drawingID: number) => store.dispatch(actionCreators.showDraw(drawingID)));

    connection.on('AddLine', (playerID: number, drawingID: number, points: Point[]) => store.dispatch(actionCreators.addLine(playerID, drawingID, points)));

    connection.on('PromptVote', (drawingID: number) => store.dispatch(actionCreators.showVote(drawingID)));

    connection.on('IndicateVoted', (playerID: number) => store.dispatch(actionCreators.playerVoted(playerID)));

    connection.on('ShowVoteResult', (drawingID: number, playerIDs: number[], votes: number[]) => store.dispatch(actionCreators.showVoteResult(drawingID, playerIDs, votes)));

    connection.on('ShowEndGame', (playerIDs: number[], scores: number[]) => store.dispatch(actionCreators.showEndGame(playerIDs, scores)));
*/
    connection.start().then(callback());
}
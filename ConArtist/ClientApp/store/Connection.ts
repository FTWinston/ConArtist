import { Action, Reducer } from 'redux';
import * as signalR from '@aspnet/signalr-client';
import { push } from 'react-router-redux';

let connection = new signalR.HubConnection(
    new signalR.HttpConnection(`http://${document.location.host}/live`, {
        transport: signalR.TransportType.WebSockets
    })
);

/*
connection.on('SetPlayer', (player: number) =>
    store.dispatch(actionCreators.something(player))
);
*/

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ConnectionState {
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface CreateAction {
    type: 'CREATE_GAME',
    numSimultaneousDrawings: number,
    numDrawSteps: number,
    canChoose: boolean,
}

interface ConnectAction {
    type: 'CONNECT_GAME',
    gameID: string
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = CreateAction | ConnectAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    create: (numSimultaneousDrawings: number, numDrawSteps: number, canChoose: boolean) => <CreateAction>{
        type: 'CREATE_GAME',
        numSimultaneousDrawings: numSimultaneousDrawings,
        numDrawSteps: numDrawSteps,
        canChoose: canChoose,
    },
    connect: (id: string) => <ConnectAction>{
        type: 'CONNECT_GAME',
        gameID: id,
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<ConnectionState> = (state: ConnectionState, rawAction: Action) => {
    let action = rawAction as KnownAction;
    switch (action.type) {
        case 'CREATE_GAME':
            let createAction = action as CreateAction;
            connection.start()
                .then(() => connection
                    .invoke('CreateGame'
                        , createAction.numSimultaneousDrawings
                        , createAction.numDrawSteps
                        , createAction.canChoose)
                    .then(gameID => push(`/game/${gameID}/join`))
                );
            break;
        case 'CONNECT_GAME':
            let connectAction = action as ConnectAction;
            connection.start()
                .then(() => connection
                    .invoke('ConnectToGame', connectAction.gameID)
                    .then(() => push(`/game/${connectAction.gameID}/join`))
                );
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || { };
};

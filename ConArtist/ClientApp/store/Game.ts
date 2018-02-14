import { Action, Reducer } from 'redux';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface Point {
    X: number;
    Y: number;
}

export interface Line {
    points: Point[];
    player: PlayerInfo;
}

export interface PlayerInfo {
    ID: number;
    Name: string;
    Color: number;
}

export interface GameState {
    connected: boolean;
    localPlayer?: PlayerInfo;
    allPlayers: PlayerInfo[];
    waitingFor: PlayerInfo[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface CreateAction {
    type: 'CREATE_GAME';
    numSimultaneousDrawings: number;
    numDrawSteps: number;
    canChoose: boolean;
}

export interface ConnectAction {
    type: 'CONNECT_GAME';
    gameID: string;
}

export interface JoinGameAction {
    type: 'JOIN_GAME';
    name: string;
    color: number;
}

export interface SetLocalPlayerAction {
    type: 'SET_LOCAL_PLAYER';
    playerID: number;
}

interface UpdatePlayerListAction {
    type: 'UPDATE_PLAYER_LIST';
    players: PlayerInfo[];
}

interface UpdateBusyPlayersAction {
    type: 'UPDATE_BUSY_PLAYERS';
    playerIDs: number[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = CreateAction | ConnectAction | JoinGameAction | SetLocalPlayerAction | UpdatePlayerListAction | UpdateBusyPlayersAction;

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
    joinGame: (name: string, color: number) => <JoinGameAction>{
        type: 'JOIN_GAME',
        name: name,
        color: color,
    },
    setLocalPlayer: (id: number) => <SetLocalPlayerAction>{
        type: 'SET_LOCAL_PLAYER',
        playerID: id,
    },
    listPlayers: (players: PlayerInfo[]) => <UpdatePlayerListAction>{
        type: 'UPDATE_PLAYER_LIST',
        players: players,
    },
    waitingFor: (playerIDs: number[]) => <UpdateBusyPlayersAction>{
        type: 'UPDATE_BUSY_PLAYERS',
        playerIDs: playerIDs,
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<GameState> = (state: GameState, rawAction: Action) => {
    let action = rawAction as KnownAction;
    switch (action.type) {
        case 'CREATE_GAME':
        case 'CONNECT_GAME':
            return {
                ...state,
                connected: true,
            };

        case 'JOIN_GAME':
            break; // nothing happens here, signalR middleware sends message, and then dispatches SetLocalPlayerAction with server's response

        case 'SET_LOCAL_PLAYER':
            let setAction = action as SetLocalPlayerAction;
            let matchingPlayers = state.allPlayers.filter(f => f.ID === setAction.playerID);
            if (matchingPlayers.length !== 1) {
                console.error(matchingPlayers.length == 0
                    ? `Cannot set local player: no player found with ID ${action.playerID}`
                    : `Cannot set local player: ${matchingPlayers.length} players found with ID ${action.playerID}, should only be one`
                );
                break;
            }

            return {
                ...state,
                localPlayer: matchingPlayers[0],
            };

        case 'UPDATE_PLAYER_LIST':
            return {
                ...state,
                allPlayers: action.players,
            };

        case 'UPDATE_BUSY_PLAYERS':
            let waitingAction = action as UpdateBusyPlayersAction;
            return {
                ...state,
                waitingFor: state.allPlayers.filter(p => waitingAction.playerIDs.find(id => id === p.ID) !== undefined),
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || {
        connected: false,
        allPlayers: [],
        waitingFor: [],
    };
};

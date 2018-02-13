import { Action, Reducer } from 'redux';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface PlayerInfo {
    ID: number;
    Name: string;
    Color: number;
}

export interface GameState {
    allPlayers: PlayerInfo[];
    waitingFor: PlayerInfo[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface ListPlayersAction {
    type: 'LIST_PLAYERS';
    players: PlayerInfo[];
}
interface WaitingForAction {
    type: 'WAITING_FOR';
    playerIDs: number[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = ListPlayersAction | WaitingForAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    listPlayers: (players: PlayerInfo[]) => <ListPlayersAction>{ type: 'LIST_PLAYERS', players: players },
    waitingFor: (playerIDs: number[]) => <WaitingForAction>{ type: 'WAITING_FOR', playerIDs: playerIDs }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<GameState> = (state: GameState, rawAction: Action) => {
    let action = rawAction as KnownAction;
    switch (action.type) {
        case 'LIST_PLAYERS':
            return {
                ...state,
                allPlayers: action.players,
            };
        case 'WAITING_FOR':
            let waitingAction = action as WaitingForAction;
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
    return state || { count: 0 };
};

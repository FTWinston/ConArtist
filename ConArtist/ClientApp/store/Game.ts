import { Action, Reducer } from 'redux';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export enum ViewMode {
    NotConnected,
    Idle,
    SetupDrawing,
    DrawLine,
    Vote,
    VoteResults,
    EndGame,
}

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

export interface Drawing {
    ID: number;
    commissioner: PlayerInfo;
    lines: Line[];
    clue: string;
}

export interface GameState {
    viewMode: ViewMode;
    expandDrawing?: Drawing;
    localPlayer?: PlayerInfo;
    drawings: Drawing[];
    allPlayers: PlayerInfo[];
    waitingFor: PlayerInfo[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface CreateAction {
    type: 'CLIENT_CREATE_GAME';
    numSimultaneousDrawings: number;
    numDrawSteps: number;
    canChoose: boolean;
}

export interface ConnectAction {
    type: 'CLIENT_CONNECT_GAME';
    gameID: string;
}

export interface JoinGameAction {
    type: 'CLIENT_JOIN_GAME';
    name: string;
    color: number;
}

export interface SetLocalPlayerAction {
    type: 'SERVER_SET_LOCAL_PLAYER';
    playerID: number;
}

interface UpdatePlayerListAction {
    type: 'SERVER_UPDATE_PLAYER_LIST';
    players: PlayerInfo[];
}

interface UpdateBusyPlayersAction {
    type: 'SERVER_UPDATE_BUSY_PLAYERS';
    playerIDs: number[];
}

export interface SetupDrawingAction {
    type: 'CLIENT_SETUP_DRAWING';
    subject: string;
    clue: string;
    imposterPlayerID?: number;
}

export interface AddLineAction {
    type: 'SERVER_ADD_LINE';
    drawingID: number;
    points: Point[];
}

export interface DrawLineAction {
    type: 'CLIENT_DRAW_LINE';
    drawingID: number;
    points: Point[];
}

export interface VoteAction {
    type: 'CLIENT_VOTE';
    drawingID: number;
    suspectPlayerID: number;
}

interface StartGameAction {
    type: 'SERVER_START_GAME';
}

interface ShowDrawingSetupAction {
    type: 'SERVER_SHOW_DRAWING_SETUP';
}

interface ShowDrawAction {
    type: 'SERVER_SHOW_DRAW';
    drawingID: number;
}

interface ShowVoteAction {
    type: 'SERVER_SHOW_VOTE';
    drawingID: number;
}

interface IndicateVotedAction {
    type: 'SERVER_INDICATE_VOTED';
    playerID: number;
}

interface ShowVoteResultAction {
    type: 'SERVER_SHOW_VOTE_RESULT';
    drawingID: number;
    playerIDs: number[];
    votes: number[];
}

interface ShowEndGameAction {
    type: 'SERVER_SHOW_END_GAME';
    playerIDs: number[];
    scores: number[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = CreateAction | ConnectAction | JoinGameAction | SetLocalPlayerAction | UpdatePlayerListAction
    | UpdateBusyPlayersAction | SetupDrawingAction | AddLineAction | DrawLineAction | VoteAction | StartGameAction
    | ShowDrawingSetupAction | ShowDrawAction | ShowVoteAction | IndicateVotedAction | ShowVoteResultAction | ShowEndGameAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    createGame: (numSimultaneousDrawings: number, numDrawSteps: number, canChoose: boolean) => <CreateAction>{
        type: 'CLIENT_CREATE_GAME',
        numSimultaneousDrawings: numSimultaneousDrawings,
        numDrawSteps: numDrawSteps,
        canChoose: canChoose,
    },
    connect: (id: string) => <ConnectAction>{
        type: 'CLIENT_CONNECT_GAME',
        gameID: id,
    },
    joinGame: (name: string, color: number) => <JoinGameAction>{
        type: 'CLIENT_JOIN_GAME',
        name: name,
        color: color,
    },
    setLocalPlayer: (id: number) => <SetLocalPlayerAction>{
        type: 'SERVER_SET_LOCAL_PLAYER',
        playerID: id,
    },
    listPlayers: (players: PlayerInfo[]) => <UpdatePlayerListAction>{
        type: 'SERVER_UPDATE_PLAYER_LIST',
        players: players,
    },
    waitingFor: (playerIDs: number[]) => <UpdateBusyPlayersAction>{
        type: 'SERVER_UPDATE_BUSY_PLAYERS',
        playerIDs: playerIDs,
    },
    startGame: () => <StartGameAction>{
        type: 'SERVER_START_GAME',
    },
    showDrawingSetup: () => <ShowDrawingSetupAction>{
        type: 'SERVER_SHOW_DRAWING_SETUP',
    },
    showDraw: (drawingID: number) => <ShowDrawAction>{
        type: 'SERVER_SHOW_DRAW',
        drawingID: drawingID,
    },
    addLine: (playerID: number, drawingID: number, points: Point[]) => <AddLineAction>{
        type: 'SERVER_ADD_LINE',
        playerID: playerID,
        drawingID: drawingID,
        points: points,
    },
    showVote: (drawingID: number) => <ShowVoteAction>{
        type: 'SERVER_SHOW_VOTE',
        drawingID: drawingID,
    },
    indicateVoted: (playerID: number) => <IndicateVotedAction>{
        type: 'SERVER_INDICATE_VOTED',
        playerID: playerID,
    },
    showVoteResult: (drawingID: number, playerIDs: number[], votes: number[]) => <ShowVoteResultAction>{
        type: 'SERVER_SHOW_VOTE_RESULT',
        drawingID: drawingID,
        playerIDs: playerIDs,
        votes: votes,
    },
    showEndGame: (playerIDs: number[], scores: number[]) => <ShowEndGameAction>{
        type: 'SERVER_SHOW_END_GAME',
        playerIDs: playerIDs,
        scores: scores,
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<GameState> = (state: GameState, rawAction: Action) => {
    let action = rawAction as KnownAction;
    switch (action.type) {
        case 'CLIENT_CREATE_GAME':
        case 'CLIENT_CONNECT_GAME':
        case 'CLIENT_JOIN_GAME':
        case 'CLIENT_SETUP_DRAWING':
        case 'CLIENT_DRAW_LINE':
        case 'CLIENT_VOTE':
        case 'SERVER_START_GAME':
            return {
                ...state,
                viewMode: ViewMode.Idle,
            };

        case 'SERVER_SET_LOCAL_PLAYER':
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

        case 'SERVER_UPDATE_PLAYER_LIST':
            return {
                ...state,
                allPlayers: action.players,
            };

        case 'SERVER_UPDATE_BUSY_PLAYERS':
            let waitingAction = action as UpdateBusyPlayersAction;
            return {
                ...state,
                waitingFor: state.allPlayers.filter(p => waitingAction.playerIDs.find(id => id === p.ID) !== undefined),
            };

        case 'SERVER_SHOW_DRAWING_SETUP':
            return {
                ...state,
                viewMode: ViewMode.SetupDrawing,
            };

        case 'SERVER_SHOW_DRAW':
            let drawAction = action as ShowDrawAction;
            return {
                ...state,
                viewMode: ViewMode.DrawLine,
                expandDrawing: state.drawings.filter(d => d.ID === drawAction.drawingID)[0],
            };

        case 'SERVER_ADD_LINE':
            let addAction = action as AddLineAction;
            let drawings = state.drawings.slice();
            let drawing = state.drawings.filter(d => d.ID == addAction.drawingID)[0];
            drawing = {
                ID: drawing.ID,
                commissioner: drawing.commissioner,
                clue: drawing.clue,
                lines: drawing.lines.slice()
            };

            return {
                ...state,
                drawings: drawings,
            };

        case 'SERVER_SHOW_VOTE':
            let showAction = action as ShowVoteAction;
            return {
                ...state,
                viewMode: ViewMode.Vote,
                expandDrawing: state.drawings.filter(d => d.ID === showAction.drawingID)[0],
            };

        case 'SERVER_INDICATE_VOTED':
            let votedAction = action as IndicateVotedAction;
            return {
                ...state,
                waitingFor: state.waitingFor.filter(p => p.ID !== votedAction.playerID),
            };

        case 'SERVER_SHOW_VOTE_RESULT':
            let resultAction = action as ShowVoteResultAction;
            // TODO: display vote results of resultAction.playerIDs and resultAction.votes
            return {
                ...state,
                viewMode: ViewMode.VoteResults,
                expandDrawing: state.drawings.filter(d => d.ID === resultAction.drawingID)[0],
            };

        case 'SERVER_SHOW_END_GAME':
            let endAction = action as ShowEndGameAction;
            // TODO: display end game rankings by means of endAction.playerIDs and endAction.scores
            return {
                ...state,
                viewMode: ViewMode.EndGame,
                expandDrawing: undefined,
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || {
        viewMode: ViewMode.NotConnected,
        drawings: [],
        allPlayers: [],
        waitingFor: [],
    };
};

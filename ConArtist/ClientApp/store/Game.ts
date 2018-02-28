import { Action, Reducer } from 'redux';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export enum ViewMode {
    NotConnected,
    Open,
    Idle,
    SetupDrawing,
    DrawLine,
    Vote,
    VoteResults,
    EndGame,
}

export interface Point {
    x: number;
    y: number;
}

export interface Line {
    points: Point[];
    player: PlayerInfo;
}

export interface PlayerInfo {
    id: number;
    name: string;
    color: number;
}

export interface Drawing {
    id: number;
    commissioner: PlayerInfo;
    lines: Line[];
    clue: string;
    subject?: string;
}

export interface GameState {
    viewMode: ViewMode;
    expandDrawing?: Drawing;
    localPlayer?: PlayerInfo;
    drawings: Drawing[];
    allPlayers: PlayerInfo[];
    waitingForPlayers: PlayerInfo[];
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

export interface DisconnectAction {
    type: 'CLIENT_DISCONNECT_GAME';
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

export interface CommissionDrawingAction {
    type: 'CLIENT_SETUP_DRAWING';
    subject: string;
    clue: string;
    imposterPlayerID?: number;
}

export interface CreateDrawingAction {
    type: 'SERVER_SETUP_DRAWING';
    id: number;
    subject?: string;
    clue: string;
    commisionerPlayerID: number;
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

interface RequestStartGameAction {
    type: 'CLIENT_START_GAME';
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
export type KnownAction = CreateAction | ConnectAction | DisconnectAction | JoinGameAction | SetLocalPlayerAction
    | UpdatePlayerListAction | UpdateBusyPlayersAction | CommissionDrawingAction | CreateDrawingAction | AddLineAction
    | DrawLineAction | VoteAction | RequestStartGameAction | ShowDrawingSetupAction | ShowDrawAction | ShowVoteAction
    | IndicateVotedAction | ShowVoteResultAction | ShowEndGameAction;

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
    disconnect: () => <DisconnectAction>{
        type: 'CLIENT_DISCONNECT_GAME',
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
    requestStartGame: () => <RequestStartGameAction>{
        type: 'CLIENT_START_GAME',
    },
    showDrawingSetup: () => <ShowDrawingSetupAction>{
        type: 'SERVER_SHOW_DRAWING_SETUP',
    },
    commissionDrawing: (subject: string, clue: string) => <CommissionDrawingAction>{
        type: 'CLIENT_SETUP_DRAWING',
        subject: subject,
        clue: clue,
        // TODO: option to specify imposter
    },
    createDrawing: (id: number, subject: string, clue: string, commissionerPlayerID: number) => <CreateDrawingAction>{
        type: 'SERVER_SETUP_DRAWING',
        id: id,
        subject: subject,
        clue: clue,
        commisionerPlayerID: commissionerPlayerID,
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
        case 'CLIENT_CREATE_GAME': // don't connect to the game you create! Connecting happens when you navigate to it.
        case 'CLIENT_START_GAME':
            break;
        case 'CLIENT_CONNECT_GAME':
        case 'CLIENT_JOIN_GAME':
            return {
                ...state,
                viewMode: ViewMode.Open,
            };
        case 'CLIENT_SETUP_DRAWING':
        case 'CLIENT_DRAW_LINE':
        case 'CLIENT_VOTE':
            return {
                ...state,
                viewMode: ViewMode.Idle,
            };

        case 'CLIENT_DISCONNECT_GAME':
            return {
                ...state,
                viewMode: ViewMode.NotConnected,
            };

        case 'SERVER_SETUP_DRAWING':
            let playerID = action.commisionerPlayerID;
            let newDrawing: Drawing = {
                id: action.id,
                commissioner: state.allPlayers.filter(p => p.id === playerID)[0],
                lines: [],
                clue: action.clue,
                subject: action.subject,
            };

            return {
                ...state,
                drawings: state.drawings.concat([newDrawing]),
            }
            
        case 'SERVER_SET_LOCAL_PLAYER':
            let setAction = action as SetLocalPlayerAction;
            let matchingPlayers = state.allPlayers.filter(p => p.id === setAction.playerID);
            if (matchingPlayers.length !== 1) {
                break;
            }

            return {
                ...state,
                localPlayer: matchingPlayers[0],
            };

        case 'SERVER_UPDATE_PLAYER_LIST':
            let localPlayer: PlayerInfo | undefined;
            if (state.localPlayer !== undefined) {
                let localPlayerID = state.localPlayer.id;
                let matchingPlayers = action.players.filter(p => p.id === localPlayerID);
                if (matchingPlayers.length === 1) {
                    localPlayer = matchingPlayers[0];
                }
            }

            let waitingPlayerIDs = state.waitingForPlayers.map(w => w.id);

            return {
                ...state,
                allPlayers: action.players,
                localPlayer: localPlayer,
                waitingForPlayers: action.players.filter(p => waitingPlayerIDs.indexOf(p.id) !== -1),
            };

        case 'SERVER_UPDATE_BUSY_PLAYERS':
            let waitingAction = action as UpdateBusyPlayersAction;
            let viewMode = state.localPlayer === undefined || waitingAction.playerIDs.indexOf(state.localPlayer.id) === -1
                ? ViewMode.Idle : state.viewMode;

            return {
                ...state,
                waitingForPlayers: state.allPlayers.filter(p => waitingAction.playerIDs.indexOf(p.id) !== -1),
                viewMode: viewMode,
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
                expandDrawing: state.drawings.filter(d => d.id === drawAction.drawingID)[0],
            };

        case 'SERVER_ADD_LINE':
            let addAction = action as AddLineAction;
            let drawings = state.drawings.slice();
            let drawing = state.drawings.filter(d => d.id == addAction.drawingID)[0];
            drawing = {
                id: drawing.id,
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
                expandDrawing: state.drawings.filter(d => d.id === showAction.drawingID)[0],
            };

        case 'SERVER_INDICATE_VOTED':
            let votedAction = action as IndicateVotedAction;
            return {
                ...state,
                waitingForPlayers: state.waitingForPlayers.filter(p => p.id !== votedAction.playerID),
            };

        case 'SERVER_SHOW_VOTE_RESULT':
            let resultAction = action as ShowVoteResultAction;
            // TODO: display vote results of resultAction.playerIDs and resultAction.votes
            return {
                ...state,
                viewMode: ViewMode.VoteResults,
                expandDrawing: state.drawings.filter(d => d.id === resultAction.drawingID)[0],
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
        waitingForPlayers: [],
    };
};

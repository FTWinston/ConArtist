using ConArtist.Model;
using ConArtist.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConArtist.Hubs
{
    public interface IGameHubCommands
    {
        Task ListPlayers(IReadOnlyCollection<IPlayer> players);
        Task StartGame();
        Task PromptSetupDrawing();
        Task WaitingForPlayers(int[] playerIDs);
        Task PromptDraw(int drawingID);
        Task AddLine(int playerID, int drawingID, Point[] points);
        Task PromptVote(int drawingID);
        Task IndicateVoted(int playerID);
        Task ShowVoteResult(int drawingID, IReadOnlyCollection<int> playerIDs, IReadOnlyCollection<int> votes);
        Task ShowEndGame(IReadOnlyCollection<int> playerIDs, IReadOnlyCollection<int> scores);
    }

    public class GameHub : Hub<IGameHubCommands>
    {
        public GameHub(GameService gameService)
        {
            GameService = gameService;
        }

        private GameService GameService { get; }

        private const string GameID = "GameID";
        private const string PlayerID = "PlayerID";

        public string CreateGame(int numSimultaneousDrawings, int numDrawSteps, bool canChoose)
        {
            var game = GameService.CreateGame(numSimultaneousDrawings, numDrawSteps, canChoose);
            return game.ID.ToString();
        }
        
        public async Task<bool> ConnectToGame(int gameID)
        {
            if (!GameService.GameAllowsNewPlayers(gameID))
                return false;

            await Groups.AddAsync(Context.ConnectionId, gameID.ToString());
            Context.Connection.Metadata[GameID] = gameID;
            await SendPlayerList(gameID);
            return true;
        }

        public async Task<int> JoinGame(string name, byte color)
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            int? playerID = GameService.JoinGame(gameID, Context.ConnectionId, name, color);

            if (!playerID.HasValue)
                return -1;

            Context.Connection.Metadata[PlayerID] = playerID;
            await SendPlayerList(gameID);
            return playerID.Value;
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var gameID = GetIntFromMetadata(GameID);
            var playerID = GetIntFromMetadata(PlayerID);

            if (gameID.HasValue && playerID.HasValue
                && GameService.LeaveGame(gameID.Value, playerID.Value))
                await SendPlayerList(gameID.Value);

            await base.OnDisconnectedAsync(exception);
        }
        
        public void StartGame()
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            var playerID = GetIntFromMetadata(PlayerID).Value;

            GameService.StartGame(gameID, playerID);
        }

        public void SetupDrawing(string subject, string clue, int? imposterPlayerID = null)
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            var playerID = GetIntFromMetadata(PlayerID).Value;
            GameService.SetupDrawing(gameID, playerID, subject, clue, imposterPlayerID);
        }

        public void AddLine(int drawingID, Point[] points)
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            var playerID = GetIntFromMetadata(PlayerID).Value;
            GameService.AddLine(gameID, playerID, drawingID, points);
        }

        public async Task Vote(int drawingID, int suspectPlayerID)
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            var playerID = GetIntFromMetadata(PlayerID).Value;
            GameService.Vote(gameID, playerID, drawingID, suspectPlayerID);
            // TODO: can't this just get at the "busy players" list rather than have a separate message?
            await Clients.Group(gameID.ToString()).IndicateVoted(playerID);
        }



        private int? GetIntFromMetadata(string key)
        {
            var objVal = Context.Connection.Metadata[key];
            if (objVal == null || !(objVal is int))
                return null;
            return (int)objVal;
        }

        private async Task SendPlayerList(int gameID)
        {
            var players = GameService.ListPlayers(gameID);
            await Clients.Group(gameID.ToString()).ListPlayers(players);
        }
    }
}
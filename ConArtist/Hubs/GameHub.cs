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

        public async Task<string> CreateGame(int numSimultaneousDrawings, int numDrawSteps, bool canChoose)
        {
            var game = GameService.CreateGame(numSimultaneousDrawings, numDrawSteps, canChoose);

            string gameID = game.ID.ToString();

            game.StatusChanged += (o, e) => StatusChanged(gameID, e.Game.Status);
            game.WaitingForPlayers += async (o, e) => await SendWaitingForPlayers(gameID, e.Game.Players.Values);
            game.OwnerSelected += async (o, e) => await PromptSetupDrawing(gameID, e.Player);
            game.PromptDraw += async (o, e) => await PromptDraw(gameID, e.Player, e.Drawing);
            game.LineAdded += async (o, e) => await SendNewLine(gameID, e.Player, e.Drawing);
            game.VoteStarted += async (o, e) => await PromptVote(gameID, e.Drawing);
            game.VoteFinished += async (o, e) => await ShowVoteResult(gameID, e.Drawing);

            await ConnectToGame(game.ID);

            return gameID;
        }

        public async Task ConnectToGame(int gameID)
        {
            await Groups.AddAsync(Context.ConnectionId, gameID.ToString());
            Context.Connection.Metadata[GameID] = gameID;
            await SendPlayerList(gameID);
        }

        public async Task<int> JoinGame(string name, byte color)
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            int playerID = GameService.JoinGame(gameID, Context.ConnectionId, name, color);
            Context.Connection.Metadata[PlayerID] = playerID;
            await SendPlayerList(gameID);
            return playerID;
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
            await Clients.Group(gameID.ToString()).IndicateVoted(playerID);
        }



        private int? GetIntFromMetadata(string key)
        {
            var objVal = Context.Connection.Metadata[key];
            if (objVal == null || objVal is int)
                return null;
            return (int)objVal;
        }

        private async Task SendPlayerList(int gameID)
        {
            var players = (List<IPlayer>)GameService.ListPlayers(gameID);
            await Clients.Group(gameID.ToString()).ListPlayers(players);
        }

        private void StatusChanged(string gameID, GameStatus status)
        {
            switch (status)
            {
                case GameStatus.Describing:
                case GameStatus.Drawing:
                case GameStatus.Voting:
                case GameStatus.Finished:
                    break;
                    // TODO: send whatever depending on new status
            }
        }

        private async Task SendWaitingForPlayers(string gameID, IReadOnlyCollection<Player> players)
        {
            var playerIDs = players
                .Where(p => p.IsBusy)
                .Select(p => p.ID)
                .ToArray();

            var group = Clients.Group(gameID);
            await group.WaitingForPlayers(playerIDs);
        }

        private async Task PromptSetupDrawing(string gameID, Player player)
        {
            await Clients.Client(player.ConnectionID).PromptSetupDrawing();
        }

        private async Task PromptDraw(string gameID, Player player, Drawing drawing)
        {
            await Clients.Client(player.ConnectionID).PromptDraw(drawing.ID);
        }

        private async Task SendNewLine(string gameID, Player player, Drawing drawing)
        {
            var group = Clients.Group(gameID);
            var points = drawing.Lines.Last().Points;
            await group.AddLine(player.ID, drawing.ID, points);
        }

        private async Task PromptVote(string gameID, Drawing drawing)
        {
            await Clients.Group(gameID.ToString()).PromptVote(drawing.ID);
        }

        private async Task ShowVoteResult(string gameID, Drawing drawing)
        {
            await Clients.Group(gameID.ToString()).ShowVoteResult(drawing.ID, drawing.Votes.Keys, drawing.Votes.Values);
        }
    }
}
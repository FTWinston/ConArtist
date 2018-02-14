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
        void ListPlayers(IReadOnlyCollection<IPlayer> players);
        void StartGame();
        void PromptSetupDrawing();
        void WaitingForPlayers(int[] playerIDs);
        void PromptDraw(int drawingID);
        void AddLine(int playerID, int drawingID, Point[] points);
        void PromptVote(int drawingID);
        void IndicateVoted(int playerID);
        void ShowVoteResult(int drawingID, IReadOnlyCollection<int> playerIDs, IReadOnlyCollection<int> votes);
        void ShowEndGame(IReadOnlyCollection<int> playerIDs, IReadOnlyCollection<int> scores);
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
            game.WaitingForPlayers += (o, e) => WaitingForPlayers(gameID, e.Game.Players.Values);
            game.OwnerSelected += (o, e) => PromptSetupDrawing(gameID, e.Player);
            game.PromptDraw += (o, e) => PromptDraw(gameID, e.Player, e.Drawing);
            game.LineAdded += (o, e) => SendNewLine(gameID, e.Player, e.Drawing);
            game.VoteStarted += (o, e) => PromptVote(gameID, e.Drawing);
            game.VoteFinished += (o, e) => ShowVoteResult(gameID, e.Drawing);

            await ConnectToGame(game.ID);

            return gameID;
        }

        public async Task ConnectToGame(int gameID)
        {
            await Groups.AddAsync(Context.ConnectionId, gameID.ToString());
            Context.Connection.Metadata[GameID] = gameID;
            SendPlayerList(gameID);
        }

        public int JoinGame(string name, byte color)
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            int playerID = GameService.JoinGame(gameID, Context.ConnectionId, name, color);
            Context.Connection.Metadata[PlayerID] = playerID;
            SendPlayerList(gameID);
            return playerID;
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var gameID = GetIntFromMetadata(GameID);
            var playerID = GetIntFromMetadata(PlayerID);

            if (gameID.HasValue && playerID.HasValue
                && GameService.LeaveGame(gameID.Value, playerID.Value))
                SendPlayerList(gameID.Value);

            return base.OnDisconnectedAsync(exception);
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

        public void Vote(int drawingID, int suspectPlayerID)
        {
            var gameID = GetIntFromMetadata(GameID).Value;
            var playerID = GetIntFromMetadata(PlayerID).Value;
            GameService.Vote(gameID, playerID, drawingID, suspectPlayerID);
            Clients.Group(gameID.ToString()).IndicateVoted(playerID);
        }



        private int? GetIntFromMetadata(string key)
        {
            var objVal = Context.Connection.Metadata[key];
            if (objVal == null || objVal is int)
                return null;
            return (int)objVal;
        }

        private void SendPlayerList(int gameID)
        {
            var players = (List<IPlayer>)GameService.ListPlayers(gameID);
            Clients.Group(gameID.ToString()).ListPlayers(players);
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

        private void WaitingForPlayers(string gameID, IReadOnlyCollection<Player> players)
        {
            var playerIDs = players
                .Where(p => p.IsBusy)
                .Select(p => p.ID)
                .ToArray();

            var group = Clients.Group(gameID);
            group.WaitingForPlayers(playerIDs);
        }

        private void PromptSetupDrawing(string gameID, Player player)
        {
            Clients.Client(player.ConnectionID).PromptSetupDrawing();
        }

        private void PromptDraw(string gameID, Player player, Drawing drawing)
        {
            Clients.Client(player.ConnectionID).PromptDraw(drawing.ID);
        }

        private void SendNewLine(string gameID, Player player, Drawing drawing)
        {
            var group = Clients.Group(gameID);
            var points = drawing.Lines.Last().Points;
            group.AddLine(player.ID, drawing.ID, points);
        }

        private void PromptVote(string gameID, Drawing drawing)
        {
            Clients.Group(gameID.ToString()).PromptVote(drawing.ID);
        }

        private void ShowVoteResult(string gameID, Drawing drawing)
        {
            Clients.Group(gameID.ToString()).ShowVoteResult(drawing.ID, drawing.Votes.Keys, drawing.Votes.Values);
        }
    }
}
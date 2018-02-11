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
        void ListPlayers(List<IPlayer> players);
        void StartGame();
        void PromptSetupDrawing();
        void WaitingForPlayers(int[] playerIDs);
        void PromptDraw(int drawingID);
        void AddLine(int playerID, int drawingID, Point[] points);
        void PromptVote(int drawingID);
        void IndicateVoted(int playerID);
        void ShowVoteResult(int drawingID, IReadOnlyCollection<int> playerIDs, IReadOnlyCollection<int> votes);
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

            string gameID = game.ID.ToString();

            game.StatusChanged += (o, e) => StatusChanged(gameID, e.Game.Status);
            game.WaitingForPlayers += (o, e) => WaitingForPlayers(gameID, e.Game.Players.Values);
            game.OwnerSelected += (o, e) => PromptSetupDrawing(gameID, e.Player);
            game.PromptDraw += (o, e) => PromptDraw(gameID, e.Player, e.Drawing);
            game.LineAdded += (o, e) => SendNewLine(gameID, e.Player, e.Drawing);
            game.VoteStarted += (o, e) => PromptVote(gameID, e.Drawing);
            game.VoteFinished += (o, e) => ShowVoteResult(gameID, e.Drawing);

            return gameID;
        }
        
        public async Task JoinGame(int gameID, string name, byte color)
        {
            int playerID = GameService.JoinGame(gameID, Context.ConnectionId, name, color);
            Context.Connection.Metadata[GameID] = gameID;
            Context.Connection.Metadata[PlayerID] = playerID;
            
            await Groups.AddAsync(Context.ConnectionId, gameID.ToString());
            SendPlayerList(gameID);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var gameID = GetIntFromMetadata(GameID);
            var playerID = GetIntFromMetadata(PlayerID);

            if (GameService.LeaveGame(gameID, playerID))
                SendPlayerList(gameID);

            return base.OnDisconnectedAsync(exception);
        }

        public void SetupDrawing(string subject, string clue)
        {
            var gameID = GetIntFromMetadata(GameID);
            var playerID = GetIntFromMetadata(PlayerID);
            GameService.SetupDrawing(gameID, playerID, subject, clue, null);
        }

        public void SetupDrawing(string subject, string clue, int imposterPlayerID)
        {
            var gameID = GetIntFromMetadata(GameID);
            var playerID = GetIntFromMetadata(PlayerID);
            GameService.SetupDrawing(gameID, playerID, subject, clue, imposterPlayerID);
        }

        public void AddLine(int drawingID, Point[] points)
        {
            var gameID = GetIntFromMetadata(GameID);
            var playerID = GetIntFromMetadata(PlayerID);
            GameService.AddLine(gameID, playerID, drawingID, points);
        }

        public void Vote(int drawingID, int suspectPlayerID)
        {
            var gameID = GetIntFromMetadata(GameID);
            var playerID = GetIntFromMetadata(PlayerID);
            GameService.Vote(gameID, playerID, drawingID, suspectPlayerID);
            Clients.Group(gameID.ToString()).IndicateVoted(playerID);
        }



        private int GetIntFromMetadata(string key)
        {
            var objVal = Context.Connection.Metadata[key];
            if (objVal == null || objVal is int)
                throw new Exception($"Connection doesn't have {key} metadata value");
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
                // TODO: send whatever depending on new status
            }
            throw new NotImplementedException();
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
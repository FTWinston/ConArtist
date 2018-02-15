using ConArtist.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConArtist.Services
{
    public class GameService
    {
        private Dictionary<int, Game> CurrentGames { get; } = new Dictionary<int, Game>();
        private Random random = new Random();

        private Game GetGame(int gameID)
        {
            if (CurrentGames.TryGetValue(gameID, out Game game))
                return game;

            throw new Exception($"Game not found: {gameID}");
        }

        private Player GetPlayer(Game game, int playerID)
        {
            if (game.Players.TryGetValue(playerID, out Player player))
                return player;

            throw new Exception($"Player not found in game {game.ID}: {playerID}");
        }

        private Drawing GetDrawing(Game game, int drawingID)
        {
            if (game.Drawings.TryGetValue(drawingID, out Drawing drawing))
                return drawing;

            throw new Exception($"Drawing not found in game {game.ID}: {drawingID}");
        }

        private Player SelectRandomPlayer(Game game, params Player[] ignorePlayers)
        {
            return SelectRandomPlayer(game, (IEnumerable<Player>)ignorePlayers);
        }

        private Player SelectRandomPlayer(Game game, IEnumerable<Player> ignorePlayers)
        {
            var options = game.Players.Values.Except(ignorePlayers).ToArray();
            return options[random.Next(options.Length)];
        }

        private void EnsureStatus(Game game, GameStatus status)
        {
            if (game.Status != status)
                throw new Exception($"Game {game.ID} status is not '{status}'");
        }

        public Game CreateGame(int numSimultaneousDrawings, int numDrawSteps, bool canChooseImposter)
        {
            var game = new Game(CurrentGames.Count, numSimultaneousDrawings, numDrawSteps, canChooseImposter);
            CurrentGames.Add(game.ID, game);

            // TODO: if no one joins, remove it after a short period

            return game;
        }

        public IReadOnlyCollection<Player> ListPlayers(int gameID)
        {
            Game game = GetGame(gameID);
            return game.Players.Values;
        }

        public int? JoinGame(int gameID, string connectionID, string name, byte color)
        {
            Game game = GetGame(gameID);
            var player = new Player(game.Players.Count, connectionID, name, color);

            if (!CanJoinGame(game, player))
                return null;

            game.Players.Add(player.ID, player);

            return player.ID;
        }

        public bool GameAllowsNewPlayers(int gameID)
        {
            if (!CurrentGames.TryGetValue(gameID, out Game game))
                return false;

            if (game.Status != GameStatus.Open)
                return false;

            return true;
        }

        private bool CanJoinGame(Game game, Player player)
        {
            if (game.Status != GameStatus.Open)
                return false;

            if (game.Players.ContainsKey(player.ID))
                return false; // already in game

            if (game.Players.Values.Any(p => p.Name.Equals(player.Name, StringComparison.InvariantCultureIgnoreCase)))
                return false; // another player has that name

            if (player.Color > 16 || game.Players.Values.Any(p => p.Color == player.Color))
                return false; // another player has that color

            return true;
        }

        public bool LeaveGame(int gameID, int playerID)
        {
            Game game = GetGame(gameID);

            var player = game.Players[playerID];

            if (game.Players.Count == 1)
            {// last player leaving, discard the game
                CurrentGames.Remove(game.ID);
                return false;
            }

            // tweak game so it can keep running

            if (player.IsBusy)
                ; // TODO: something ... are they drawing or setting up?

            // remove from nextPlayers (key and value)
            Player nextPlayer;
            if (game.NextPlayers.TryGetValue(playerID, out nextPlayer))
            {
                var prevPlayerID = game.NextPlayers.Single(kvp => kvp.Value == player).Key;
                game.NextPlayers[prevPlayerID] = nextPlayer;
            }

            game.Players.Remove(playerID);
            return true;
        }

        public void StartGame(int gameID, int playerID)
        {
            Game game = GetGame(gameID);
            EnsureStatus(game, GameStatus.Open);
            GetPlayer(game, playerID);

            InitializeGame(game);
        }

        public void RestartGame(int gameID, int playerID)
        {
            Game game = GetGame(gameID);
            EnsureStatus(game, GameStatus.Finished);
            GetPlayer(game, playerID);

            game.Drawings.Clear();
            InitializeGame(game);
        }

        private void InitializeGame(Game game)
        {
            SetupPlayerOrder(game);
            AllocateOwners(game);
            game.Status = GameStatus.Describing;
        }

        private void AllocateOwners(Game game)
        {
            var ownerPlayers = new List<Player>();
            int numDrawings = Math.Max(game.NumSimultaneousDrawings, game.Players.Count);

            for (int iDrawing = 0; iDrawing < numDrawings; iDrawing++)
            {
                var player = SelectRandomPlayer(game, ownerPlayers);
                player.IsBusy = true;
                game.FireOwnerSelected(player);
                ownerPlayers.Add(player);
            }

            game.FireWaitingForPlayers();
        }

        private List<T> RandomizeOrder<T>(IEnumerable<T> values)
        {
            var entries = new List<T>(values);

            for (int i = entries.Count - 1; i > 0; i -= 1)
            {
                int j = random.Next(i + 1);
                T temp = entries[i];
                entries[i] = entries[j];
                entries[j] = temp;
            }

            return entries;
        }

        public void SetupDrawing(int gameID, int playerID, string subject, string clue, int? imposterPlayerID)
        {
            Game game = GetGame(gameID);
            EnsureStatus(game, GameStatus.Describing);
            Player player = GetPlayer(game, playerID);

            if (!player.IsBusy)
                throw new Exception($"Player {playerID} cannot set up a drawing in game {gameID}");

            if (imposterPlayerID.HasValue != game.CanChooseImposter)
            {
                if (game.CanChooseImposter)
                    throw new Exception($"Player {playerID} failed to select an imposter player in game {gameID}");
                else
                    throw new Exception($"Player {playerID} cannot select an imposter player in game {gameID}");
            }
            
            player.IsBusy = false;

            Player imposter;
            if (imposterPlayerID.HasValue)
                imposter = GetPlayer(game, imposterPlayerID.Value);
            else
                imposter = SelectRandomPlayer(game, player);

            var drawing = new Drawing(game.Drawings.Count, player, imposter, subject, clue);
            game.Drawings.Add(drawing.ID, drawing);

            if (HaveAllDrawingsBeenAdded(game))
            {
                game.Status = GameStatus.Drawing;
                AdvanceDrawingsToNextPlayers(game);
            }
        }

        private bool HaveAllDrawingsBeenAdded(Game game)
        {
            return game.Drawings.Count == game.NumSimultaneousDrawings;
        }

        public void AddLine(int gameID, int playerID, int drawingID, Point[] points)
        {
            Game game = GetGame(gameID);
            EnsureStatus(game, GameStatus.Drawing);
            Player player = GetPlayer(game, playerID);
            Drawing drawing = GetDrawing(game, drawingID);

            if (drawing.CurrentDrawer != player)
                throw new Exception($"Player {playerID} is not currently drawing {drawingID} in game " + gameID);

            drawing.CurrentDrawer.IsBusy = false;
            drawing.Lines.Add(new Line(player, points));
            game.FireLineAdded(player, drawing);

            if (!AreAnyPlayersBusy(game))
                AdvanceDrawingsToNextPlayers(game);
        }

        private bool AreAnyPlayersBusy(Game game)
        {
            return game.Drawings.Values.Any(d => d.CurrentDrawer.IsBusy);
        }

        private void SetupPlayerOrder(Game game)
        {
            game.NextPlayers.Clear();

            var players = RandomizeOrder(game.Players.Values);

            for (int iOrder = 1; iOrder < players.Count; iOrder++)
            {
                var player = players[iOrder - 1];
                var nextPlayer = players[iOrder];
                
                player.IsBusy = false;
                game.NextPlayers.Add(player.ID, nextPlayer);
            }

            game.NextPlayers.Add(players[players.Count - 1].ID, players[0]);
        }
        
        private void AdvanceDrawingsToNextPlayers(Game game)
        {
            int numDrawingsWithOwner = 0;
            foreach (var drawing in game.Drawings.Values)
            {
                drawing.CurrentDrawer = game.NextPlayers[drawing.CurrentDrawer.ID];

                if (drawing.CurrentDrawer == drawing.Commissioner)
                {
                    numDrawingsWithOwner++;
                }
                else
                {
                    drawing.CurrentDrawer.IsBusy = true;
                    game.FirePromptDraw(drawing);
                }
            }

            if (numDrawingsWithOwner == 0)
                return;

            if (numDrawingsWithOwner != game.NumSimultaneousDrawings)
                throw new Exception($"Only {numDrawingsWithOwner} / {game.NumSimultaneousDrawings} drawings in game {game.ID} are with their owner");

            game.NumDrawSteps++;

            if (game.NumDrawSteps < game.MaxDrawSteps)
            {
                AdvanceDrawingsToNextPlayers(game);
            }
            else
            {
                game.Status = GameStatus.Voting;
                game.VoteDrawing = GetNextVoteDrawing(game);
            }
        }

        public void Vote(int gameID, int votingPlayerID, int drawingID, int suspectPlayerID)
        {
            Game game = GetGame(gameID);
            EnsureStatus(game, GameStatus.Voting);
            Drawing drawing = GetDrawing(game, drawingID);
            Player votingPlayer = GetPlayer(game, votingPlayerID);
            Player suspectPlayer = GetPlayer(game, suspectPlayerID);

            if (drawing != game.VoteDrawing)
                throw new Exception($"Cannot vote on drawing {drawingID} as this is not the one currently being voted on in game {gameID}");

            if (drawing.VotedPlayers.Contains(votingPlayerID))
                throw new Exception($"Player {votingPlayerID} has already voted for drawing {drawingID} in game {gameID}");

            drawing.VotedPlayers.Add(votingPlayerID);

            if (drawing.Votes.ContainsKey(suspectPlayerID))
                drawing.Votes[suspectPlayerID]++;
            else
                drawing.Votes[suspectPlayerID] = 1;

            if (HaveAllPlayersVoted(game))
            {
                game.FinishVote(drawing);

                game.VoteDrawing = GetNextVoteDrawing(game);

                if (game.VoteDrawing == null)
                    game.Status = GameStatus.Finished;
            }
        }

        private Drawing GetNextVoteDrawing(Game game)
        {
            return game.Drawings.Values.FirstOrDefault(d => d.VotedPlayers.Count == 0);
        }

        private bool HaveAllPlayersVoted(Game game)
        {
            return game.VoteDrawing.VotedPlayers.Count == game.Players.Count;
        }
    }
}

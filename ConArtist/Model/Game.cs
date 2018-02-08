using System;
using System.Collections.Generic;

namespace ConArtist.Model
{
    public class Game
    {
        public Game(int id, int numSimultaneousDrawings, int numDrawLaps, bool canChooseImposter)
        {
            ID = id;
            NumSimultaneousDrawings = numSimultaneousDrawings;
            NumDrawLaps = numDrawLaps;
            CanChooseImposter = canChooseImposter;
        }

        public int ID { get; }

        private GameStatus _status;
        public GameStatus Status
        {
            get { return _status; }
            set
            {
                _status = value;
                StatusChanged?.Invoke(this, new GameEventArgs(this));
            }
        }

        private Dictionary<int, Player> _players { get; } = new Dictionary<int, Player>();
        public IReadOnlyDictionary<int, Player> Players => _players;
        public void AddPlayer(Player player)
        {
            _players.Add(player.ID, player);
        }

        public Dictionary<int, Player> NextPlayers { get; } = new Dictionary<int, Player>();

        private Dictionary<int, Drawing> _drawings { get; } = new Dictionary<int, Drawing>();
        public IReadOnlyDictionary<int, Drawing> Drawings => _drawings;
        public void AddDrawing(Drawing drawing)
        {
            _drawings.Add(drawing.ID, drawing);
            DrawingAdded?.Invoke(this, new GameEventArgs(this, drawing.Owner, drawing));
        }
        public void RemoveAllDrawings() { _drawings.Clear(); }

        public int NumSimultaneousDrawings { get; }
        public int NumDrawLaps { get; }
        public bool CanChooseImposter { get; }

        private Drawing _voteDrawing;
        public Drawing VoteDrawing
        {
            get { return _voteDrawing; }
            set
            {
                _voteDrawing = value;
                if (value != null)
                    VoteStarted?.Invoke(this, new GameEventArgs(this, value));
            }
        }

        public void FireOwnerSelected(Player player)
        {
            OwnerSelected?.Invoke(this, new GameEventArgs(this, player));
        }

        public void FirePromptDraw(Drawing drawing)
        {
            PromptDraw?.Invoke(this, new GameEventArgs(this, drawing.CurrentDrawer, drawing));
        }

        public void FireLineAdded(Player player, Drawing drawing)
        {
            LineAdded?.Invoke(this, new GameEventArgs(this, player, drawing));
        }

        public void FinishVote(Drawing drawing)
        {
            VoteFinished?.Invoke(this, new GameEventArgs(this, drawing));
        }

        public event EventHandler<GameEventArgs> StatusChanged, OwnerSelected, DrawingAdded, PromptDraw, LineAdded, VoteStarted, VoteFinished;
    }
}

using System;
using System.Collections.Generic;

namespace ConArtist.Model
{
    public class Game
    {
        public Game(int id, int numSimultaneousDrawings, int numDrawSteps, bool canChooseImposter)
        {
            ID = id;
            NumSimultaneousDrawings = numSimultaneousDrawings;
            MaxDrawSteps = numDrawSteps;
            NumDrawSteps = 0;
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
        
        public Dictionary<int, Player> Players => new Dictionary<int, Player>();

        public Dictionary<int, Player> NextPlayers { get; } = new Dictionary<int, Player>();

        public Dictionary<int, Drawing> Drawings { get; } = new Dictionary<int, Drawing>();

        public int NumSimultaneousDrawings { get; }
        public int NumDrawSteps { get; set; }
        public int MaxDrawSteps { get; }
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

        public void FireWaitingForPlayers()
        {
            WaitingForPlayers?.Invoke(this, new GameEventArgs(this));
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

        public event EventHandler<GameEventArgs> StatusChanged, OwnerSelected, WaitingForPlayers, PromptDraw, LineAdded, VoteStarted, VoteFinished;
    }
}

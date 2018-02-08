using System;
using System.Collections.Generic;

namespace ConArtist.Model
{
    public class GameEventArgs : EventArgs
    {
        public GameEventArgs(Game game)
            : this(game, null, null) { }

        public GameEventArgs(Game game, Player player)
        : this(game, player, null) { }

        public GameEventArgs(Game game, Drawing drawing)
        : this(game, null, drawing) { }

        public GameEventArgs(Game game, Player player, Drawing drawing)
        {
            Game = game;
            Player = player;
            Drawing = drawing;
        }

        public Game Game { get; }
        public Player Player { get; }
        public Drawing Drawing { get; }
    }
}

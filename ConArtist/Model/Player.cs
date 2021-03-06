﻿namespace ConArtist.Model
{
    public interface IPlayer
    {
        int ID { get; }
        string Name { get; }
        byte Color { get; }
    }

    public class Player : IPlayer
    {
        public Player(int id, string connectionID, string name, byte color)
        {
            ID = id;
            ConnectionID = connectionID;
            Name = name;
            Color = color;
        }

        public int ID { get; }
        public string Name { get; }
        public string ConnectionID { get; }
        public byte Color { get; }
        public bool IsBusy { get; set; } = false;
    }
}

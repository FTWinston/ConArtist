namespace ConArtist.Model
{
    public interface IPlayer
    {
        string Name { get; }
        byte Color { get; }
    }

    public class Player : IPlayer
    {
        public Player(int id, string name, string connectionID, byte color)
        {
            ID = id;
            Name = name;
            ConnectionID = connectionID;
            Color = color;
        }

        public int ID { get; }
        public string Name { get; }
        public string ConnectionID { get; }
        public byte Color { get; }
        public bool IsBusy { get; set; } = false;
    }
}

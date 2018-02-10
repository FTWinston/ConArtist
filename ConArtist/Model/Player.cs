namespace ConArtist.Model
{
    public class Player
    {
        public Player(int id, string name, string color)
        {
            ID = id;
            Name = name;
            Color = color;
        }

        public int ID { get; }
        public string Name { get; }
        public string Color { get; }
        public bool IsSettingUpDrawing { get; set; } = false;
        public bool IsDrawing { get; set; } = false;
    }
}

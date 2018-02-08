namespace ConArtist.Model
{
    public class Line
    {
        public Line(Player drawer, Point[] points)
        {
            Drawer = drawer;
            Points = points;
        }

        public Player Drawer { get; }
        public Point[] Points { get; }
    }
}

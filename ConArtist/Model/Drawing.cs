using System.Collections.Generic;

namespace ConArtist.Model
{
    public class Drawing
    {
        public Drawing(int id, Player owner, Player imposter, string subject, string clue)
        {
            ID = id;
            Owner = PreviousDrawer = owner;
            Imposter = imposter;
            Subject = subject;
            Clue = clue;
        }

        public int ID { get; }
        public Player Owner { get; }
        public Player Imposter { get; }
        public Player CurrentDrawer { get; set; }
        public Player PreviousDrawer { get; set; }
        public string Subject { get; }
        public string Clue { get; }
        public List<Line> Lines { get; } = new List<Line>();
        public Dictionary<int, Player> Votes { get; } = new Dictionary<int, Player>();
        public HashSet<int> VotedPlayers { get; } = new HashSet<int>();
    }
}

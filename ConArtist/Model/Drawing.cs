using System.Collections.Generic;

namespace ConArtist.Model
{
    public class Drawing
    {
        public Drawing(int id, Player owner, Player imposter, string subject, string clue)
        {
            ID = id;
            Commissioner = CurrentDrawer = owner;
            Imposter = imposter;
            Subject = subject;
            Clue = clue;
        }

        public int ID { get; }
        public Player Commissioner { get; }
        public Player Imposter { get; }
        public Player CurrentDrawer { get; set; }
        public string Subject { get; }
        public string Clue { get; }
        public List<Line> Lines { get; } = new List<Line>();
        public SortedDictionary<int, int> Votes { get; } = new SortedDictionary<int, int>();
        public HashSet<int> VotedPlayers { get; } = new HashSet<int>();
    }
}

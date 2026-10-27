// Offline & Development Mock Dataset for iMovies
// Ensures the client is 100% functional and interactive even before connecting to MongoDB

export const MOCK_MOVIES = [
  {
    _id: 'm1',
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: 'English',
    duration: 166,
    rating: 8.8,
    releaseDate: '2024-03-01',
    posterColor: '#c29047',
    posterShape: 'circle',
    featured: true,
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    status: 'now_showing',
  },
  {
    _id: 'm2',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Drama', 'History', 'Biography'],
    language: 'English',
    duration: 180,
    rating: 8.9,
    releaseDate: '2023-07-21',
    posterColor: '#e76f51',
    posterShape: 'bars',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    status: 'now_showing',
  },
  {
    _id: 'm3',
    title: 'Inception',
    slug: 'inception',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    language: 'English',
    duration: 148,
    rating: 8.8,
    releaseDate: '2024-02-15',
    posterColor: '#2a9d8f',
    posterShape: 'waves',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    status: 'now_showing',
  },
  {
    _id: 'm4',
    title: 'Avengers: Endgame',
    slug: 'avengers-endgame',
    synopsis: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance.',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    duration: 181,
    rating: 8.4,
    releaseDate: '2024-04-10',
    posterColor: '#457b9d',
    posterShape: 'star',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    status: 'now_showing',
  },
  {
    _id: 'm5',
    title: 'Jawan',
    slug: 'jawan',
    synopsis: 'A driven man is on a mission to rectify the wrongs in society and fulfill a promise made years ago. He comes up against a monstrous outlaw with no fear.',
    genre: ['Action', 'Thriller'],
    language: 'Hindi',
    duration: 169,
    rating: 7.8,
    releaseDate: '2023-09-07',
    posterColor: '#e63946',
    posterShape: 'triangle',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    status: 'now_showing',
  },
  {
    _id: 'm6',
    title: 'Interstellar',
    slug: 'interstellar',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: 'English',
    duration: 169,
    rating: 8.7,
    releaseDate: '2024-01-20',
    posterColor: '#1d3557',
    posterShape: 'ring',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    status: 'now_showing',
  },
  {
    _id: 'm7',
    title: 'Leo',
    slug: 'leo',
    synopsis: 'Parthiban is a mild-mannered cafe owner in Kashmir who fends off a gang of murderous thugs and gains attention that brings an old cartel back into his peaceful life.',
    genre: ['Action', 'Crime', 'Thriller'],
    language: 'Tamil',
    duration: 164,
    rating: 7.9,
    releaseDate: '2023-10-19',
    posterColor: '#2b9348',
    posterShape: 'diamond',
    featured: false,
    cities: ['Mumbai', 'Bangalore', 'Chennai'],
    status: 'now_showing',
  },
  {
    _id: 'm8',
    title: 'Salaar: Part 1 - Ceasefire',
    slug: 'salaar',
    synopsis: 'A gang leader makes a promise to a dying friend and takes on other criminal gangs in the dystopian city of Khansaar.',
    genre: ['Action', 'Drama'],
    language: 'Telugu',
    duration: 175,
    rating: 7.5,
    releaseDate: '2023-12-22',
    posterColor: '#582f0e',
    posterShape: 'hexagon',
    featured: false,
    cities: ['Bangalore', 'Hyderabad', 'Mumbai'],
    status: 'now_showing',
  },
  {
    _id: 'm9',
    title: 'Past Lives',
    slug: 'past-lives',
    synopsis: 'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Noras family emigrates from South Korea. Decades later, they are reunited for one fateful week.',
    genre: ['Drama', 'Romance'],
    language: 'English',
    duration: 105,
    rating: 7.9,
    releaseDate: '2024-02-09',
    posterColor: '#9b5de5',
    posterShape: 'cross',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore'],
    status: 'now_showing',
  },
];

export const MOCK_THEATRES = [
  {
    _id: 't1',
    name: 'PVR INOX: Phoenix Palladium',
    city: 'Mumbai',
    address: 'Lower Parel, Mumbai',
    screens: [{ name: 'Audi 1 (IMAX Laser)', rows: 6, seatsPerRow: 8 }],
  },
  {
    _id: 't2',
    name: 'Cinépolis: Grand Mall',
    city: 'Mumbai',
    address: 'Andheri West, Mumbai',
    screens: [{ name: 'Screen 2 (Dolby Atmos)', rows: 6, seatsPerRow: 8 }],
  },
  {
    _id: 't3',
    name: 'PVR: Select Citywalk',
    city: 'Delhi',
    address: 'Saket District Centre, New Delhi',
    screens: [{ name: 'Screen 1', rows: 6, seatsPerRow: 8 }],
  },
  {
    _id: 't4',
    name: 'INOX: Orion Megaplex',
    city: 'Bangalore',
    address: 'Rajajinagar, Bangalore',
    screens: [{ name: 'Screen 1 (Insignia)', rows: 6, seatsPerRow: 8 }],
  },
];

export const generateMockShows = (movieId, city = 'Mumbai', dateStr = '') => {
  const matchingTheatres = MOCK_THEATRES.filter(
    (t) => t.city.toLowerCase() === (city || 'mumbai').toLowerCase()
  );
  const targetTheatres = matchingTheatres.length > 0 ? matchingTheatres : [MOCK_THEATRES[0], MOCK_THEATRES[1]];

  const shows = [];
  const times = ['10:30 AM', '01:45 PM', '05:15 PM', '08:45 PM', '11:15 PM'];

  targetTheatres.forEach((theatre, tIdx) => {
    times.slice(tIdx, tIdx + 3).forEach((time, sIdx) => {
      shows.push({
        _id: `show_${movieId || 'm1'}_${theatre._id}_${sIdx}`,
        movieId: movieId || 'm1',
        theatreId: theatre,
        screenName: theatre.screens[0]?.name || 'Screen 1',
        time,
        date: dateStr || new Date().toISOString().split('T')[0],
        pricing: {
          standard: 180,
          premium: 260,
          vip: 420,
        },
        status: 'active',
      });
    });
  });

  return shows;
};

export const generateMockSeats = (showId) => {
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats = [];

  rowLetters.forEach((row, rIdx) => {
    let type = 'standard';
    if (rIdx >= 4) type = 'vip';
    else if (rIdx >= 2) type = 'premium';

    for (let num = 1; num <= 8; num++) {
      // Simulate random realistic taken seats (e.g., C3, C4, D4)
      const isBooked = (row === 'C' && (num === 3 || num === 4)) || (row === 'D' && num === 5);
      seats.push({
        _id: `seat_${showId}_${row}${num}`,
        showId,
        row,
        number: num,
        type,
        status: isBooked ? 'booked' : 'available',
        price: type === 'vip' ? 420 : type === 'premium' ? 260 : 180,
      });
    }
  });

  return seats;
};

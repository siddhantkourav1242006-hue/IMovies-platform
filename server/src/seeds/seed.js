/**
 * iMovies - Database Seed Script
 * Populates realistic initial data: users, movies, theatres, shows, and seats
 * Run with: npm run seed
 */
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');

const sampleUsers = [
  {
    name: 'Admin Priya',
    email: 'admin@imovies.com',
    passwordHash: 'Admin@12345',
    role: 'admin',
    phone: '+919876543210',
    city: 'Mumbai',
  },
  {
    name: 'Operations Lead',
    email: 'ops@imovies.com',
    passwordHash: 'Ops@12345',
    role: 'admin',
    phone: '+919876543211',
    city: 'Delhi',
  },
  {
    name: 'Aanya Sharma',
    email: 'aanya@example.com',
    passwordHash: 'User@12345',
    role: 'user',
    phone: '+919820011223',
    city: 'Mumbai',
  },
  {
    name: 'Rohan Verma',
    email: 'rohan@example.com',
    passwordHash: 'User@12345',
    role: 'user',
    phone: '+919811122334',
    city: 'Delhi',
  },
  {
    name: 'Kavya Nair',
    email: 'kavya@example.com',
    passwordHash: 'User@12345',
    role: 'user',
    phone: '+919844455667',
    city: 'Bangalore',
  },
];

const sampleMovies = [
  {
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future.',
    genre: ['Sci-Fi', 'Adventure'],
    language: 'English',
    duration: 166,
    rating: 8.8,
    releaseDate: new Date('2024-03-01'),
    posterColor: '#1a1a2e',
    posterShape: 'circle',
    featured: true,
    cities: ['Mumbai', 'Delhi', 'Bangalore'],
    status: 'now_showing',
  },
  {
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Drama', 'History'],
    language: 'English',
    duration: 180,
    rating: 8.9,
    releaseDate: new Date('2023-07-21'),
    posterColor: '#264653',
    posterShape: 'bars',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore'],
    status: 'now_showing',
  },
  {
    title: 'Jawan',
    slug: 'jawan',
    synopsis: 'A driven man is on a mission to rectify the wrongs in a society and fulfill a promise made years ago. He comes up against a monstrous outlaw with no fear.',
    genre: ['Action', 'Thriller'],
    language: 'Hindi',
    duration: 169,
    rating: 7.8,
    releaseDate: new Date('2023-09-07'),
    posterColor: '#e94560',
    posterShape: 'triangle',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore'],
    status: 'now_showing',
  },
  {
    title: 'Leo',
    slug: 'leo',
    synopsis: 'Parthiban is a mild-mannered cafe owner in Kashmir who fends off a gang of murderous thugs and gains attention that brings an old cartel back into his peaceful life.',
    genre: ['Action', 'Crime'],
    language: 'Tamil',
    duration: 164,
    rating: 7.9,
    releaseDate: new Date('2023-10-19'),
    posterColor: '#1b4332',
    posterShape: 'diamond',
    featured: false,
    cities: ['Bangalore', 'Mumbai'],
    status: 'now_showing',
  },
  {
    title: 'Salaar',
    slug: 'salaar',
    synopsis: 'A gang leader makes a promise to a dying friend and takes on other criminal gangs in the dystopian city of Khansaar.',
    genre: ['Action', 'Drama'],
    language: 'Telugu',
    duration: 175,
    rating: 7.5,
    releaseDate: new Date('2023-12-22'),
    posterColor: '#2b2d42',
    posterShape: 'square',
    featured: false,
    cities: ['Bangalore', 'Hyderabad'],
    status: 'now_showing',
  },
  {
    title: 'Past Lives',
    slug: 'past-lives',
    synopsis: 'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora’s family emigrates from South Korea. Decades later, they are reunited for one fateful week.',
    genre: ['Drama', 'Romance'],
    language: 'English',
    duration: 105,
    rating: 8.0,
    releaseDate: new Date('2023-06-02'),
    posterColor: '#d4a373',
    posterShape: 'waves',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore'],
    status: 'now_showing',
  },
  {
    title: 'Interstellar',
    slug: 'interstellar',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    genre: ['Sci-Fi', 'Adventure'],
    language: 'English',
    duration: 169,
    rating: 8.7,
    releaseDate: new Date('2014-11-07'),
    posterColor: '#0f3460',
    posterShape: 'ring',
    featured: false,
    cities: ['Mumbai', 'Delhi'],
    status: 'now_showing',
  },
  {
    title: '12th Fail',
    slug: '12th-fail',
    synopsis: 'Based on the true story of Manoj Kumar Sharma who overcame extreme poverty and corruption to become an Indian Police Service officer.',
    genre: ['Drama', 'Biography'],
    language: 'Hindi',
    duration: 147,
    rating: 9.1,
    releaseDate: new Date('2023-10-27'),
    posterColor: '#533483',
    posterShape: 'hexagon',
    featured: false,
    cities: ['Mumbai', 'Delhi', 'Bangalore'],
    status: 'now_showing',
  },
  {
    title: 'Manjummel Boys',
    slug: 'manjummel-boys',
    synopsis: 'A group of friends from a small town embark on a vacation to Kodaikanal, where an unexpected accident at the Guna Caves turns their friendship into a race against impossible odds.',
    genre: ['Thriller', 'Adventure'],
    language: 'Tamil',
    duration: 135,
    rating: 8.5,
    releaseDate: new Date('2024-02-22'),
    posterColor: '#16213e',
    posterShape: 'cross',
    featured: false,
    cities: ['Bangalore', 'Mumbai'],
    status: 'now_showing',
  },
  {
    title: 'Madgaon Express',
    slug: 'madgaon-express',
    synopsis: 'Three childhood friends embark on a long-cherished trip to Goa that goes completely off-track after an accidental mix-up with contraband luggage.',
    genre: ['Comedy'],
    language: 'Hindi',
    duration: 143,
    rating: 7.4,
    releaseDate: new Date('2024-03-22'),
    posterColor: '#8d99ae',
    posterShape: 'star',
    featured: false,
    cities: ['Mumbai', 'Delhi'],
    status: 'now_showing',
  },
];

const sampleTheatres = [
  {
    name: 'PVR ICON, Palladium Mall',
    city: 'Mumbai',
    address: 'High Street Phoenix, Lower Parel, Mumbai',
    screens: [
      {
        name: 'Screen 1 (IMAX)',
        rows: 6,
        seatsPerRow: 8,
        seatLayout: [
          { type: 'vip', rows: ['F'] },
          { type: 'premium', rows: ['D', 'E'] },
          { type: 'standard', rows: ['A', 'B', 'C'] },
        ],
      },
      {
        name: 'Screen 2',
        rows: 6,
        seatsPerRow: 8,
        seatLayout: [
          { type: 'premium', rows: ['E', 'F'] },
          { type: 'standard', rows: ['A', 'B', 'C', 'D'] },
        ],
      },
    ],
  },
  {
    name: 'INOX Megaplex, Inorbit Mall',
    city: 'Mumbai',
    address: 'Link Road, Malad West, Mumbai',
    screens: [
      {
        name: 'Audi 1 (Dolby Atmos)',
        rows: 6,
        seatsPerRow: 8,
        seatLayout: [
          { type: 'vip', rows: ['F'] },
          { type: 'premium', rows: ['D', 'E'] },
          { type: 'standard', rows: ['A', 'B', 'C'] },
        ],
      },
    ],
  },
  {
    name: 'PVR Select Citywalk',
    city: 'Delhi',
    address: 'A-3, District Centre, Saket, New Delhi',
    screens: [
      {
        name: 'Screen 1',
        rows: 6,
        seatsPerRow: 8,
        seatLayout: [
          { type: 'vip', rows: ['F'] },
          { type: 'premium', rows: ['D', 'E'] },
          { type: 'standard', rows: ['A', 'B', 'C'] },
        ],
      },
    ],
  },
  {
    name: 'Cinepolis, DLF Avenue',
    city: 'Delhi',
    address: 'Saket Commercial Complex, New Delhi',
    screens: [
      {
        name: 'Screen 1',
        rows: 6,
        seatsPerRow: 8,
        seatLayout: [
          { type: 'premium', rows: ['E', 'F'] },
          { type: 'standard', rows: ['A', 'B', 'C', 'D'] },
        ],
      },
    ],
  },
  {
    name: 'PVR Nexus Koramangala',
    city: 'Bangalore',
    address: 'Hosur Road, Koramangala 7th Block, Bangalore',
    screens: [
      {
        name: 'Screen 1 (IMAX)',
        rows: 6,
        seatsPerRow: 8,
        seatLayout: [
          { type: 'vip', rows: ['F'] },
          { type: 'premium', rows: ['D', 'E'] },
          { type: 'standard', rows: ['A', 'B', 'C'] },
        ],
      },
    ],
  },
];

async function seed() {
  try {
    console.log('🌱 Starting iMovies database seed...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Seat.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Favorite.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('Cleared existing collections.');

    // Insert Users
    const createdUsers = [];
    for (const u of sampleUsers) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`✓ Inserted ${createdUsers.length} users (2 admins, 3 standard users)`);

    // Insert Movies
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`✓ Inserted ${createdMovies.length} movies with geometric poster tokens`);

    // Insert Sample Reviews
    await Review.insertMany([
      {
        userId: createdUsers[2]._id,
        movieId: createdMovies[0]._id,
        rating: 5,
        comment: 'A visual spectacle and cinematic triumph! The audio mixing in IMAX was breathtaking.',
        status: 'approved',
      },
      {
        userId: createdUsers[3]._id,
        movieId: createdMovies[1]._id,
        rating: 5,
        comment: 'Incredible performances and direction by Christopher Nolan. A must-watch masterpiece.',
        status: 'approved',
      },
    ]);
    console.log('✓ Inserted verified audience reviews');

    // Insert Theatres
    const createdTheatres = await Theatre.insertMany(sampleTheatres);
    console.log(`✓ Inserted ${createdTheatres.length} theatres across Mumbai, Delhi, Bangalore`);

    // Generate Shows for today and the next 2 days
    const dates = [
      new Date(),
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 48 * 60 * 60 * 1000),
    ];
    const showTimes = ['11:30', '15:00', '18:45', '21:30'];

    const createdShows = [];
    const allSeats = [];

    for (const theatre of createdTheatres) {
      const matchingMovies = createdMovies.filter((m) => m.cities.includes(theatre.city));
      const screen = theatre.screens[0];

      for (const date of dates) {
        for (let i = 0; i < 2; i++) {
          const movie = matchingMovies[i % matchingMovies.length];
          const time = showTimes[i * 2 + 1];

          const show = new Show({
            movieId: movie._id,
            theatreId: theatre._id,
            screenName: screen.name,
            date: new Date(date.toISOString().split('T')[0]),
            time,
            pricing: {
              standard: 250,
              premium: 350,
              vip: 500,
            },
            status: 'active',
          });
          await show.save();
          createdShows.push(show);

          // Generate seats for this show based on the theatre screen configuration
          const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
          for (let r = 0; r < screen.rows; r++) {
            const rowChar = rowLetters[r];
            let seatType = 'standard';

            for (const section of screen.seatLayout) {
              if (section.rows.includes(rowChar)) {
                seatType = section.type;
                break;
              }
            }

            for (let num = 1; num <= screen.seatsPerRow; num++) {
              allSeats.push({
                showId: show._id,
                row: rowChar,
                number: num,
                type: seatType,
                status: 'available',
                lockedBy: null,
                lockedAt: null,
                bookedBy: null,
              });
            }
          }
        }
      }
    }

    console.log(`✓ Generated ${createdShows.length} shows`);
    if (allSeats.length > 0) {
      await Seat.insertMany(allSeats);
      console.log(`✓ Generated ${allSeats.length} individual seats with TTL lock support`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('Sample Admin credentials:');
    console.log('  Email: admin@imovies.com | Password: Admin@12345');
    console.log('Sample User credentials:');
    console.log('  Email: aanya@example.com | Password: User@12345\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

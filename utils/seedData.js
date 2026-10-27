const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const FnBItem = require('../models/FnBItem');
const Wishlist = require('../models/Wishlist');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[Seed]: Connected to Database...');

    // Clear existing data
    await User.deleteMany();
    await Movie.deleteMany();
    await Theater.deleteMany();
    await Showtime.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Coupon.deleteMany();
    await FnBItem.deleteMany();
    await Wishlist.deleteMany();
    console.log('[Seed]: Cleared existing collections.');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@imovies.com',
      password: 'Admin@123',
      phone: '+91 9876543210',
      role: 'admin',
    });

    const testUser = await User.create({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'Test@123',
      phone: '+91 9123456780',
      role: 'user',
    });
    console.log('[Seed]: Users created (admin@imovies.com / Admin@123)');

    // 2. Seed Movies (Popular real movies with high quality visual banners)
    const moviesData = [
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        language: 'English',
        duration: 148,
        rating: 4.8,
        totalReviews: 45,
        releaseDate: new Date('2024-05-10'),
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
        director: 'Christopher Nolan',
        certification: 'UA',
        status: 'now-showing',
        featured: true,
        cast: [
          { name: 'Leonardo DiCaprio', role: 'Cobb', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
          { name: 'Joseph Gordon-Levitt', role: 'Arthur', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
          { name: 'Elliot Page', role: 'Ariadne', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance to the universe.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        duration: 181,
        rating: 4.9,
        totalReviews: 88,
        releaseDate: new Date('2024-04-26'),
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c',
        director: 'Anthony & Joe Russo',
        certification: 'UA',
        status: 'now-showing',
        featured: true,
        cast: [
          { name: 'Robert Downey Jr.', role: 'Tony Stark / Iron Man', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
          { name: 'Chris Evans', role: 'Steve Rogers / Captain America', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        language: 'English',
        duration: 169,
        rating: 4.9,
        totalReviews: 64,
        releaseDate: new Date('2024-06-15'),
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
        director: 'Christopher Nolan',
        certification: 'U',
        status: 'now-showing',
        featured: true,
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
          { name: 'Anne Hathaway', role: 'Brand', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        genre: ['Drama', 'History', 'Biography'],
        language: 'English',
        duration: 180,
        rating: 4.7,
        totalReviews: 52,
        releaseDate: new Date('2024-07-21'),
        posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
        director: 'Christopher Nolan',
        certification: 'A',
        status: 'now-showing',
        featured: true,
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
          { name: 'Emily Blunt', role: 'Kitty Oppenheimer', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'RRR',
        description: 'A fearless warrior on a perilous mission comes face to face with a steely cop serving British forces in pre-independent India.',
        genre: ['Action', 'Drama', 'Period'],
        language: 'Telugu',
        duration: 187,
        rating: 4.9,
        totalReviews: 95,
        releaseDate: new Date('2024-03-25'),
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/NgBoMJy386M',
        director: 'S. S. Rajamouli',
        certification: 'UA',
        status: 'now-showing',
        featured: true,
        cast: [
          { name: 'N. T. Rama Rao Jr.', role: 'Komaram Bheem', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
          { name: 'Ram Charan', role: 'Alluri Sitarama Raju', photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'English',
        duration: 152,
        rating: 4.9,
        totalReviews: 120,
        releaseDate: new Date('2024-01-15'),
        posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
        director: 'Christopher Nolan',
        certification: 'UA',
        status: 'now-showing',
        featured: false,
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne / Batman', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
          { name: 'Heath Ledger', role: 'Joker', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'Jawan',
        description: 'A high-octane action thriller which outlines the emotional journey of a man who is set out to rectify the wrongs in society.',
        genre: ['Action', 'Thriller'],
        language: 'Hindi',
        duration: 169,
        rating: 4.6,
        totalReviews: 70,
        releaseDate: new Date('2024-09-07'),
        posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/COv52Qyctws',
        director: 'Atlee',
        certification: 'UA',
        status: 'now-showing',
        featured: false,
        cast: [
          { name: 'Shah Rukh Khan', role: 'Vikram & Azad Rathore', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
          { name: 'Nayanthara', role: 'Narmada Rai', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'KGF Chapter 2',
        description: 'In the blood-soaked Kolar Gold Fields, Rocky whose name strikes fear in the hearts of his foes, must battle against adversaries seeking revenge.',
        genre: ['Action', 'Drama'],
        language: 'Kannada',
        duration: 168,
        rating: 4.8,
        totalReviews: 82,
        releaseDate: new Date('2024-04-14'),
        posterUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/JKa05nyUmuQ',
        director: 'Prashanth Neel',
        certification: 'UA',
        status: 'now-showing',
        featured: false,
        cast: [
          { name: 'Yash', role: 'Rocky', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
          { name: 'Sanjay Dutt', role: 'Adheera', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'Spider-Man: No Way Home',
        description: 'With Spider-Man identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds appear.',
        genre: ['Action', 'Adventure', 'Fantasy'],
        language: 'English',
        duration: 148,
        rating: 4.8,
        totalReviews: 110,
        releaseDate: new Date('2024-12-17'),
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/JfVOs4VSpmA',
        director: 'Jon Watts',
        certification: 'UA',
        status: 'now-showing',
        featured: false,
        cast: [
          { name: 'Tom Holland', role: 'Peter Parker', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
          { name: 'Zendaya', role: 'MJ', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
        ],
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: 'English',
        duration: 166,
        rating: 4.9,
        totalReviews: 30,
        releaseDate: new Date('2026-11-20'),
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
        director: 'Denis Villeneuve',
        certification: 'UA',
        status: 'coming-soon',
        featured: true,
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
          { name: 'Zendaya', role: 'Chani', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
        ],
      },
    ];

    const movies = await Movie.insertMany(moviesData);
    console.log(`[Seed]: ${movies.length} Movies created.`);

    // 3. Seed Theaters
    const defaultSeatMap = [
      { row: 'A', type: 'vip', seats: 8 },
      { row: 'B', type: 'vip', seats: 8 },
      { row: 'C', type: 'premium', seats: 12 },
      { row: 'D', type: 'premium', seats: 12 },
      { row: 'E', type: 'premium', seats: 12 },
      { row: 'F', type: 'standard', seats: 14 },
      { row: 'G', type: 'standard', seats: 14 },
      { row: 'H', type: 'standard', seats: 14 },
      { row: 'I', type: 'standard', seats: 14 },
      { row: 'J', type: 'standard', seats: 14 },
    ];

    const theatersData = [
      {
        name: 'PVR Cinemas — Phoenix Palladium',
        location: 'Lower Parel, Mumbai',
        screens: [
          { name: 'IMAX Laser 4K (Screen 1)', rows: 10, seatsPerRow: 14, seatMap: defaultSeatMap },
          { name: 'Dolby Atmos Gold (Screen 2)', rows: 10, seatsPerRow: 14, seatMap: defaultSeatMap },
          { name: 'Screen 3 Standard', rows: 10, seatsPerRow: 14, seatMap: defaultSeatMap },
        ],
      },
      {
        name: 'INOX Megaplex — Orion Mall',
        location: 'Rajajinagar, Bangalore',
        screens: [
          { name: 'Insignia Luxe (Screen 1)', rows: 10, seatsPerRow: 14, seatMap: defaultSeatMap },
          { name: 'Screen 2 4DX', rows: 10, seatsPerRow: 14, seatMap: defaultSeatMap },
          { name: 'Screen 3 Atmos', rows: 10, seatsPerRow: 14, seatMap: defaultSeatMap },
        ],
      },
    ];

    const theaters = await Theater.insertMany(theatersData);
    console.log(`[Seed]: ${theaters.length} Theaters created.`);

    // 4. Seed Showtimes for next 7 days
    const showtimesToInsert = [];
    const showTimesList = ['10:30 AM', '01:30 PM', '04:45 PM', '08:15 PM', '11:00 PM'];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + dayOffset);
      showDate.setHours(0, 0, 0, 0);

      movies.slice(0, 6).forEach((movie) => {
        theaters.forEach((theater) => {
          theater.screens.forEach((screen, screenIndex) => {
            // Pick 2-3 showtimes
            const chosenTimes = [showTimesList[0], showTimesList[2], showTimesList[3]];
            chosenTimes.forEach((time) => {
              // Pre-book random 4-8 seats for realistic map
              const sampleBooked = [];
              if (Math.random() > 0.3) {
                sampleBooked.push('F4', 'F5', 'C3', 'C4', 'A1', 'A2');
              }
              showtimesToInsert.push({
                movie: movie._id,
                theater: theater._id,
                screenIndex,
                date: showDate,
                time,
                price: { standard: 150, premium: 250, vip: 400 },
                bookedSeats: sampleBooked,
              });
            });
          });
        });
      });
    }

    const showtimes = await Showtime.insertMany(showtimesToInsert);
    console.log(`[Seed]: ${showtimes.length} Showtimes created.`);

    // 5. Seed Coupons
    const couponsData = [
      {
        code: 'FIRST50',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscount: 200,
        minBookingAmount: 300,
        validUntil: new Date('2027-12-31'),
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'FLAT100',
        discountType: 'flat',
        discountValue: 100,
        maxDiscount: 100,
        minBookingAmount: 500,
        validUntil: new Date('2027-12-31'),
        usageLimit: 500,
        isActive: true,
      },
      {
        code: 'MOVIE25',
        discountType: 'percentage',
        discountValue: 25,
        maxDiscount: 150,
        minBookingAmount: 200,
        validUntil: new Date('2027-12-31'),
        usageLimit: 2000,
        isActive: true,
      },
    ];
    await Coupon.insertMany(couponsData);
    console.log(`[Seed]: Coupons seeded.`);

    // 6. Seed F&B Items
    const fnbData = [
      { name: 'Jumbo Butter Popcorn', category: 'popcorn', price: 350, image: '🍿', isAvailable: true },
      { name: 'Cheese Burst Popcorn', category: 'popcorn', price: 400, image: '🧀', isAvailable: true },
      { name: 'Pepsi Large (650ml)', category: 'beverage', price: 200, image: '🥤', isAvailable: true },
      { name: 'Cold Brew Gourmet Coffee', category: 'beverage', price: 180, image: '☕', isAvailable: true },
      { name: 'Cheesy Jalapeño Nachos', category: 'snack', price: 260, image: '🍟', isAvailable: true },
      { name: 'Couple Saver Combo (2 Popcorn + 2 Drinks)', category: 'combo', price: 599, image: '🎉', isAvailable: true },
    ];
    await FnBItem.insertMany(fnbData);
    console.log(`[Seed]: F&B Items seeded.`);

    // 7. Seed Reviews
    await Review.create({
      user: testUser._id,
      movie: movies[0]._id,
      rating: 5,
      comment: 'An absolute masterpiece of cinema! The sound design and visuals blew my mind in IMAX.',
    });
    console.log(`[Seed]: Sample reviews seeded.`);

    console.log('\n========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Default Admin: admin@imovies.com | Admin@123');
    console.log('Default User:  john@test.com     | Test@123');
    console.log('========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();

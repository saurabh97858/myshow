// Images & logos
import logo from './logo.svg';
import marvelLogo from './marvelLogo.svg';
import googlePlay from './googlePlay.svg';
import appStore from './appStore.svg';
import screenImage from './screenImage.svg';
import profile from './profile.png';

// Export assets
export const assets = {
  logo,
  marvelLogo,
  googlePlay,
  appStore,
  screenImage,
  profile,
};

export const groupRows = [
  ["A", "B"],
  ["C", "D"],
  ["E", "F"],
  ["G", "H"],
  ["I", "J"],
];

// ✅ Fixed Dummy trailers (YouTube links + thumbnails)
export const dummyTrailers = [
  {
    image: 'https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=WpW36ldAqnM',
  },
  {
    image: 'https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=-sAOWhvheK8',
  },
  {
    image: 'https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=1pHDWnXmK7Y',
  },
  {
    image: 'https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=umiKiW4En9g',
  },
];

// ✅ Dummy cast data (unchanged)
const dummyCastData = [
  { name: 'Milla Jovovich', profile_path: 'https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg' },
  { name: 'Dave Bautista', profile_path: 'https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg' },
  { name: 'Arly Jover', profile_path: 'https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg' },
  { name: 'Amara Okereke', profile_path: 'https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg' },
  { name: 'Fraser James', profile_path: 'https://image.tmdb.org/t/p/original/mGAPQG2OKTgdKFkp9YpvCSqcbgY.jpg' },
  { name: 'Deirdre Mullins', profile_path: 'https://image.tmdb.org/t/p/original/lJm89neuiVlYISEqNpGZA5kTAnP.jpg' },
  { name: 'Sebastian Stankiewicz', profile_path: 'https://image.tmdb.org/t/p/original/hLN0Ca09KwQOFLZLPIEzgTIbqqg.jpg' },
  { name: 'Tue Lunding', profile_path: 'https://image.tmdb.org/t/p/original/qY4W0zfGBYzlCyCC0QDJS1Muoa0.jpg' },
  { name: 'Jacek Dzisiewicz', profile_path: 'https://image.tmdb.org/t/p/original/6Ksb8ANhhoWWGnlM6O1qrySd7e1.jpg' },
  { name: 'Ian Hanmore', profile_path: 'https://image.tmdb.org/t/p/original/yhI4MK5atavKBD9wiJtaO1say1p.jpg' },
  { name: 'Eveline Hall', profile_path: 'https://image.tmdb.org/t/p/original/uPq4xUPiJIMW5rXF9AT0GrRqgJY.jpg' },
  { name: 'Kamila Klamut', profile_path: 'https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg' },
  { name: 'Caoilinn Springall', profile_path: 'https://image.tmdb.org/t/p/original/uZNtbPHowlBYo74U1qlTaRlrdiY.jpg' },
  { name: 'Jan Kowalewski', profile_path: 'https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg' },
  { name: 'Pawel Wysocki', profile_path: 'https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg' },
  { name: 'Simon Lööf', profile_path: 'https://image.tmdb.org/t/p/original/cbZrB8crWlLEDjVUoak8Liak6s.jpg' },
  { name: 'Tomasz Cymerman', profile_path: 'https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg' },
];

// ✅ Dummy shows/movies (renamed `casts` → `cast`)
export const dummyShowsData = [
  {
    _id: '324544',
    id: 324544,
    title: 'In the Lost Lands',
    overview:
      'A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.',
    poster_path: 'https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/op3qmNhvwEvyT7UFyPbIfQmKriB.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 14, name: 'Fantasy' },
      { id: 12, name: 'Adventure' },
    ],
    cast: dummyCastData, // ✅ FIXED
    release_date: '2025-02-27',
    original_language: 'en',
    tagline: 'She seeks the power to free her people.',
    vote_average: 6.4,
    vote_count: 15000,
    runtime: 102,
  },
  {
    _id: '1232546',
    id: 1232546,
    title: 'Until Dawn',
    overview:
      'One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers...',
    poster_path: 'https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/icFWIk1KfkWLZnugZAJEDauNZ94.jpg',
    genres: [
      { id: 27, name: 'Horror' },
      { id: 9648, name: 'Mystery' },
    ],
    cast: dummyCastData, // ✅ FIXED
    release_date: '2025-04-23',
    original_language: 'en',
    tagline: 'Every night a different nightmare.',
    vote_average: 6.405,
    vote_count: 18000,
    runtime: 103,
  },
  {
    _id: '552524',
    id: 552524,
    title: 'Lilo & Stitch',
    overview:
      'The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.',
    poster_path: 'https://image.tmdb.org/t/p/original/mKKqV23MQ0uakJS8OCE2TfV5jNS.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',
    genres: [
      { id: 10751, name: 'Family' },
      { id: 35, name: 'Comedy' },
      { id: 878, name: 'Science Fiction' },
    ],
    cast: dummyCastData, // ✅ FIXED
    release_date: '2025-05-17',
    original_language: 'en',
    tagline: 'Hold on to your coconuts.',
    vote_average: 7.117,
    vote_count: 27500,
    runtime: 108,
  },
];

// ✅ Dummy date-time data
export const dummyDateTimeData = {
  324544: [
    { date: "2025-09-26", time: "14:30" },
    { date: "2025-09-26", time: "17:00" },
    { date: "2025-09-27", time: "13:00" },
  ],
  1232546: [
    { date: "2025-09-26", time: "12:00" },
    { date: "2025-09-27", time: "15:30" },
  ],
};


// ✅ Dummy dashboard data
export const dummyDashboardData = {
  totalBookings: 14,
  totalRevenue: 1517,
  totalUser: 5,
  activeShows: [
    {
      _id: '68352363e96d99513e4221a4',
      movie: dummyShowsData[0],
      showDateTime: '2025-06-30T02:30:00.000Z',
      showPrice: 59,
      occupiedSeats: { A1: 'user_1', B1: 'user_1', C1: 'user_1' },
    },
    {
      _id: '6835238fe96d99513e4221a8',
      movie: dummyShowsData[1],
      showDateTime: '2025-06-30T15:30:00.000Z',
      showPrice: 81,
      occupiedSeats: {},
    },
  ],
};

// ✅ Dummy bookings
export const dummyBookingData = [
  {
    _id: '68396334fb83252d82e17295',
    user: { name: 'GreatStack' },
    show: {
      _id: '68352363e96d99513e4221a4',
      movie: dummyShowsData[0],
      showDateTime: '2025-06-30T02:30:00.000Z',
      showPrice: 59,
    },
    amount: 98,
    bookedSeats: ['D1', 'D2'],
    isPaid: false,
  },
  {
    _id: '68396334fb83252d82e17296',
    user: { name: 'GreatStack' },
    show: {
      _id: '68352363e96d99513e4221a4',
      movie: dummyShowsData[0],
      showDateTime: '2025-06-30T02:30:00.000Z',
      showPrice: 59,
    },
    amount: 49,
    bookedSeats: ['A1'],
    isPaid: true,
  },
];

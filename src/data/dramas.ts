export interface Drama {
  id: number;
  slug?: string;
  title: string;
  year: number;
  rating: number;
  siteRating?: number;
  siteVoteCount?: number;
  episodes: number;
  currentEpisode?: number;
  status: 'airing' | 'upcoming' | 'completed';
  genre: string[];
  channel: string;
  synopsis: string;
  image: string;
  cast: string[];
  voteCount?: string;
  trailerUrl?: string;
  maturityRating?: string;
  subtitles?: string[];
  heroImage?: string;
  // Internal fields for management
  channel_id?: number;
  imdb_rating?: number;
  site_rating?: number;
  image_url?: string;
  genreIds?: number[];
  is_hero?: boolean;
  hero_image_url?: string;
  hero_pos_x?: number;
  hero_pos_y?: number;
  hero_scale?: number;
  feature_rank?: number | null;
}

export const dramas: Drama[] = [
  {
    id: 1,
    title: "Tere Bin",
    year: 2023,
    rating: 7.4,
    episodes: 58,
    status: 'completed',
    genre: ['Romance', 'Drama', 'Family'],
    channel: 'Geo Entertainment',
    synopsis: "A tale of love, family traditions, and the clash between modern and traditional values in Pakistani society. The drama follows Murtasim and Meerab through their journey of arranged marriage to finding true love.",
    image: "https://m.media-amazon.com/images/M/MV5BZWQ5MjY3OTctNzUyZi00ZWFiLWI4YTUtYzRiYTE4MDFmODllXkEyXkFqcGc@._V1_.jpg",
    cast: ['Wahaj Ali', 'Yumna Zaidi', 'Bushra Ansari', 'Sabeena Farooq'],
    voteCount: '3.2K',
    trailerUrl: 'https://www.youtube.com/watch?v=ZIhZ9kzPVwk',
    maturityRating: "13+",
    subtitles: ["English", "Arabic", "Turkish", "Spanish"],
    heroImage: "https://img.youtube.com/vi/ZIhZ9kzPVwk/hqdefault.jpg"
  },
  {
    id: 2,
    title: "Mere Humsafar",
    year: 2022,
    rating: 8.2,
    episodes: 40,
    status: 'completed',
    genre: ['Romance', 'Drama'],
    channel: 'ARY Digital',
    synopsis: "A beautiful love story that explores the complexities of relationships within joint family systems. Hala, an orphaned girl, finds herself in a difficult household but discovers love with Hamza.",
    image: "https://m.media-amazon.com/images/M/MV5BYTljYmE1NmItZDg0Ny00OTIwLTgwMWEtZjgxNDYyMjIzZDIzXkEyXkFqcGc@._V1_.jpg",
    cast: ['Farhan Saeed', 'Hania Aamir', 'Saba Hameed', 'Samina Ahmed'],
    voteCount: '2.8K',
    trailerUrl: 'https://www.youtube.com/watch?v=fMxV4i6pMCQ',
    maturityRating: "PG-13",
    subtitles: ["English", "Arabic"]
  },
  {
    id: 3,
    title: "Khaani",
    year: 2018,
    rating: 7.7,
    episodes: 31,
    status: 'completed',
    genre: ['Drama', 'Thriller', 'Romance'],
    channel: 'Geo Entertainment',
    synopsis: "A gripping story of a strong woman seeking justice after her twin brother's murder by Mir Hadi, the powerful and spoiled son of a politician. Inspired by real events, it explores themes of power, class, and redemption.",
    image: "https://m.media-amazon.com/images/M/MV5BM2ZjMjE4OWQtMjFjNi00ZWY2LWJjMGMtNjBiNzM5NTFhMzE5XkEyXkFqcGc@._V1_.jpg",
    cast: ['Feroze Khan', 'Sana Javed', 'Mehmood Aslam', 'Saman Ansari'],
    voteCount: '3.5K',
    trailerUrl: 'https://www.youtube.com/watch?v=c0F5kHQh7e4',
    maturityRating: "16+",
    subtitles: ["English"]
  },
  {
    id: 4,
    title: "Parizaad",
    year: 2021,
    rating: 9.1,
    episodes: 29,
    status: 'completed',
    genre: ['Drama', 'Romance', 'Social'],
    channel: 'Hum TV',
    synopsis: "The extraordinary journey of an ordinary man with a golden heart, facing society's prejudices about appearance. Based on Hashim Nadeem's novel, Parizaad's life takes unexpected turns as he meets remarkable people.",
    image: "https://m.media-amazon.com/images/M/MV5BN2U0OGFjMzEtNmM0ZC00NzliLTk4MjYtNGQ1NWU3YzQxNzIyXkEyXkFqcGc@.jpg",
    cast: ['Ahmed Ali Akbar', 'Yumna Zaidi', 'Ushna Shah', 'Nauman Ijaz', 'Urwa Hocane', 'Saboor Aly'],
    voteCount: '4.6K',
    trailerUrl: 'https://www.youtube.com/watch?v=Jmp7XxXRHXk',
    maturityRating: "13+",
    subtitles: ["English", "Arabic", "French"],
    heroImage: "https://img.youtube.com/vi/Jmp7XxXRHXk/hqdefault.jpg"
  },
  {
    id: 5,
    title: "Humsafar",
    year: 2011,
    rating: 8.9,
    episodes: 23,
    status: 'completed',
    genre: ['Romance', 'Drama'],
    channel: 'Hum TV',
    synopsis: "A timeless love story that became a cultural phenomenon across South Asia. Khirad and Ashar's relationship faces tests of trust, family interference, and misunderstandings in this iconic drama.",
    image: "https://m.media-amazon.com/images/M/MV5BZWFmZmY2ODgtYzRjZi00MjQ4LTkzYjctY2JiZDc0ZDQ2YjYzXkEyXkFqcGc@.jpg",
    cast: ['Fawad Khan', 'Mahira Khan', 'Naveen Waqar', 'Atiqa Odho'],
    voteCount: '5.2K',
    trailerUrl: 'https://www.youtube.com/watch?v=c69EhHJbkP4',
    maturityRating: "13+",
    subtitles: ["English", "Arabic", "Turkish", "Spanish", "French"],
    heroImage: "https://img.youtube.com/vi/c69EhHJbkP4/hqdefault.jpg"
  },
  {
    id: 6,
    title: "Ishq Murshid",
    year: 2024,
    rating: 8.2,
    episodes: 30,
    status: 'completed',
    genre: ['Romance', 'Drama', 'Mystery'],
    channel: 'Hum TV',
    synopsis: "A mystical love story intertwining fate, spirituality, and the journey of self-discovery. When Shibra's life takes an unexpected turn, she meets Murshid—a man shrouded in mystery, and their paths become forever intertwined.",
    image: "https://m.media-amazon.com/images/M/MV5BMzY2ZTc5YzYtOThhMC00ODZmLWI5MWUtOGMyODVmYzVjNmQzXkEyXkFqcGc@._V1_.jpg",
    cast: ['Bilal Abbas Khan', 'Durefishan Saleem', 'Omair Rana', 'Shabbir Jan'],
    voteCount: '4.1K',
    trailerUrl: 'https://www.youtube.com/watch?v=tMBvgEdADtg',
    maturityRating: "13+",
    subtitles: ["English"]
  },
  {
    id: 7,
    title: "Kabhi Main Kabhi Tum",
    year: 2024,
    rating: 9.0,
    episodes: 34,
    status: 'completed',
    genre: ['Romance', 'Comedy', 'Drama'],
    channel: 'ARY Digital',
    synopsis: "Two opposite personalities—Mustafa, a carefree soul, and Sharjeena, a determined woman—find love in the most unexpected circumstances. A modern romantic comedy that won hearts across Pakistan.",
    image: "https://m.media-amazon.com/images/M/MV5BNjQxOTkwMjUtMjI5Ni00MGFlLTk4MzItNzFmZDdkZjJmMDc1XkEyXkFqcGc@.jpg",
    cast: ['Fahad Mustafa', 'Hania Aamir', 'Javed Sheikh', 'Bushra Ansari', 'Emmad Irfani'],
    voteCount: '5.8K',
    trailerUrl: 'https://www.youtube.com/watch?v=92xnilAWpAE',
    maturityRating: "PG",
    subtitles: ["English", "Arabic"],
    heroImage: "https://img.youtube.com/vi/92xnilAWpAE/hqdefault.jpg"
  },
  {
    id: 8,
    title: "Mujhe Pyaar Hua Tha",
    year: 2023,
    rating: 6.8,
    episodes: 32,
    status: 'completed',
    genre: ['Romance', 'Drama'],
    channel: 'ARY Digital',
    synopsis: "A love triangle exploring unrequited love, betrayal, and redemption. Saad is deeply in love with his cousin Maheer, but when he struggles to confess his feelings, events take an unexpected turn with Areeb.",
    image: "https://m.media-amazon.com/images/M/MV5BNzMyMzkzMTgtNjhhNi00NTM0LTg4YzctMTRlZjE2MzRjYjkwXkEyXkFqcGc@._V1_.jpg",
    cast: ['Wahaj Ali', 'Hania Aamir', 'Zaviyar Nauman Ijaz'],
    voteCount: '2.1K',
    trailerUrl: 'https://www.youtube.com/watch?v=KRcvlWgVp38',
    maturityRating: "13+",
    subtitles: ["English"]
  },
  {
    id: 9,
    title: "Meem Se Mohabbat",
    year: 2024,
    rating: 8.5,
    episodes: 30,
    currentEpisode: 15,
    status: 'airing',
    genre: ['Romance', 'Drama'],
    channel: 'Hum TV',
    synopsis: "A captivating love story exploring modern relationships and family dynamics in contemporary Pakistan. Starring Ahad Raza Mir and Dananeer Mobeen.",
    image: "https://m.media-amazon.com/images/M/MV5BZjcwNDUwMmEtZmQ0Zi00N2JlLTg2MmMtMzIxM2JjNjcwMjEzXkEyXkFqcGc@.jpg",
    cast: ['Ahad Raza Mir', 'Dananeer Mobeen'],
    voteCount: '1.8K',
    trailerUrl: 'https://www.youtube.com/watch?v=QWlIy8PWfKQ',
    maturityRating: "13+",
    subtitles: ["English"],
    heroImage: "https://img.youtube.com/vi/QWlIy8PWfKQ/hqdefault.jpg"
  },
  {
    id: 10,
    title: "Aye Ishq e Junoon",
    year: 2024,
    rating: 8.0,
    episodes: 35,
    currentEpisode: 12,
    status: 'airing',
    genre: ['Drama', 'Romance'],
    channel: 'ARY Digital',
    synopsis: "An intense story of love and obsession featuring Sheheryar Munawar and Ushna Shah.",
    image: "https://m.media-amazon.com/images/M/MV5BODQ3YzUzYmItNGQ2YS00Nzk4LTgyN2UtYmE4Mjc1ZDdmMTA4XkEyXkFqcGc@._V1_.jpg",
    cast: ['Sheheryar Munawar', 'Ushna Shah'],
    voteCount: '1.5K',
    trailerUrl: 'https://www.youtube.com/watch?v=dFy-dGsT_rc',
    maturityRating: "13+",
    subtitles: ["English"]
  },
  {
    id: 11,
    title: "Sunn Mere Dil",
    year: 2024,
    rating: 8.4,
    episodes: 40,
    currentEpisode: 10,
    status: 'airing',
    genre: ['Romance', 'Drama'],
    channel: 'Geo Entertainment',
    synopsis: "A mega-project featuring Wahaj Ali and Maya Ali in an emotional journey of love and self-discovery.",
    image: "https://m.media-amazon.com/images/M/MV5BZTY0ZGU3MjQtNjY1Mi00NzE4LTgzMDQtNmM2NzI3MjFjMGJkXkEyXkFqcGc@.jpg",
    cast: ['Wahaj Ali', 'Maya Ali'],
    voteCount: '2.3K',
    trailerUrl: 'https://www.youtube.com/watch?v=DdQ_mSeC_Wc',
    maturityRating: "13+",
    subtitles: ["English"]
  }
];

export const airingDramas: Drama[] = dramas.filter(d => d.status === 'airing');

export const upcomingDramas: Drama[] = [
  {
    id: 101,
    title: "Tere Bin Season 2",
    year: 2025,
    rating: 0,
    episodes: 40,
    status: 'upcoming',
    genre: ['Romance', 'Drama', 'Family'],
    channel: 'Geo Entertainment',
    synopsis: "The highly anticipated second season continuing the epic love story of Murtasim and Meerab.",
    image: "https://m.media-amazon.com/images/M/MV5BZWQ5MjY3OTctNzUyZi00ZWFiLWI4YTUtYzRiYTE4MDFmODllXkEyXkFqcGc@._V1_.jpg",
    cast: ['Wahaj Ali', 'Yumna Zaidi'],
    trailerUrl: 'https://www.youtube.com/watch?v=ZIhZ9kzPVwk'
  },
  {
    id: 102,
    title: "Sanwal Yaar Piya",
    year: 2024,
    rating: 8.1,
    episodes: 32,
    status: 'upcoming',
    genre: ['Romance', 'Drama'],
    channel: 'Geo Entertainment',
    synopsis: "A beautiful romantic drama exploring love and relationships in modern-day Pakistan.",
    image: "https://m.media-amazon.com/images/M/MV5BNWM2MDRiMjEtMDczMS00NTNiLTlhNzUtNmFkMmYxZmRmY2ZmXkEyXkFqcGc@._V1_.jpg",
    cast: ['Ahad Raza Mir', 'Sajal Aly'],
    trailerUrl: 'https://www.youtube.com/watch?v=7bMVR9yZnzA'
  }
];


export const topRatedDramas = [...dramas].sort((a, b) => b.rating - a.rating).slice(0, 10);
export const recommendedDramas = dramas.filter(d => d.rating >= 8.2);

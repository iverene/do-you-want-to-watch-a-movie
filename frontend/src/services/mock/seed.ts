// Sample data for the mock services. All titles, people and providers are made up.
import type { Avatar, Genre, MediaType, Reaction, Stars, Title } from '../types';
import type { Db, DbRating, DbScreening, DbUser, DbWatchlistItem } from './db';

export const ALEX = 'u-alex';
export const SAM = 'u-sam';
export const SEED_PASSWORD = 'movienight2026';
export const PROVIDERS = ['StreamBox', 'CineCloud'];

export const GENRES: Genre[] = [
  ['drama', 'Drama'],
  ['comedy', 'Comedy'],
  ['romance', 'Romance'],
  ['thriller', 'Thriller'],
  ['scifi', 'Sci-Fi'],
  ['animation', 'Animation'],
  ['horror', 'Horror'],
  ['mystery', 'Mystery'],
  ['documentary', 'Documentary'],
  ['fantasy', 'Fantasy'],
  ['adventure', 'Adventure'],
  ['crime', 'Crime'],
].map(([id, name]) => ({ id: `g-${id}`, name }));

const CAST_POOL = [
  'Mira Valdez',
  'Theo Arcangel',
  'June Okafor',
  'Rafael Lindqvist',
  'Ana Beltran',
  'Kenji Morrow',
  'Lucia Fenwick',
  'Oscar Dimaano',
  'Hazel Quint',
  'Paolo Serrano',
  'Ines Haverford',
  'Dante Reyes',
  'Clara Moon',
  'Marcus Teodoro',
  'Yuna Castell',
  'Felix Aldana',
  'Rosa Whitlock',
  'Iggy Navarro',
  'Bea Holloway',
  'Samuel Ortega',
  'Nadia Pryce',
  'Leo Bautista',
  'Willa Brandt',
  'Tomas Ilagan',
];

type Row = [string, number, string[], number, string, number?];
const MOVIES: Row[] = [
  [
    'Paper Moons',
    2019,
    ['romance', 'drama'],
    112,
    'Two night-shift printers fold a paper moon for every night they almost say it.',
  ],
  [
    'The Quiet Harbor',
    2021,
    ['drama', 'mystery'],
    124,
    'A ferry captain returns to the bay town that stopped talking about the storm of 1998.',
  ],
  [
    'Night Bus 42',
    2023,
    ['thriller', 'crime'],
    98,
    'Six strangers on the last bus out of the city realise one of them has missed their stop on purpose.',
  ],
  [
    'Lanterns for Juniper',
    2018,
    ['animation', 'fantasy'],
    94,
    'A small fox lights a lantern for each lost thing in the forest, until she finds one for herself.',
  ],
  [
    "The Cartographer's Daughter",
    2020,
    ['adventure', 'drama'],
    131,
    'She inherits her father’s unfinished map and the island it insists is real.',
  ],
  [
    'Small Hours',
    2022,
    ['comedy', 'romance'],
    101,
    'Two insomniacs keep meeting at the same 24-hour bakery and refuse to admit it is a date.',
  ],
  [
    'Salt & Static',
    2024,
    ['scifi', 'thriller'],
    117,
    'A coastal radio tower starts picking up conversations from next week.',
  ],
  [
    'A Thousand Paper Cranes Later',
    2017,
    ['drama'],
    109,
    'Three sisters meet every summer to finish a promise they made as children.',
  ],
  [
    'Kettle Mountain',
    2021,
    ['comedy', 'adventure'],
    96,
    'A retired teacher and her grandson set out to climb the hill their town calls a mountain.',
  ],
  [
    'Glasshouse Summer',
    2023,
    ['romance', 'comedy'],
    104,
    'A botanist and a florist fight over the last greenhouse in the city, then share it.',
  ],
  [
    'The Last Projectionist',
    2016,
    ['drama', 'mystery'],
    121,
    'The final night of an old cinema, and the reel nobody remembers loading.',
  ],
  [
    'Orbit of Two',
    2025,
    ['scifi', 'romance'],
    113,
    'Two engineers on a slow cargo ship have eleven months and one argument to settle.',
  ],
  [
    'Under the Tin Roof',
    2019,
    ['comedy', 'drama'],
    99,
    'A rainy-season family reunion where every leak uncovers a secret.',
  ],
  [
    'Midnight Laundromat',
    2022,
    ['comedy', 'crime'],
    92,
    'A sleepy laundromat owner gets mixed up in a heist that keeps using her dryers.',
  ],
  [
    "The Ferryman's Song",
    2018,
    ['fantasy', 'adventure'],
    127,
    'A ferryman who can only cross the river by singing loses his voice.',
  ],
  [
    'Dust in July',
    2020,
    ['crime', 'thriller'],
    115,
    'A small-town detective chases the one witness who keeps changing his story.',
  ],
  [
    'Moth & Lantern',
    2024,
    ['horror', 'mystery'],
    103,
    'Something in the old lighthouse only comes out when the power fails.',
  ],
  [
    'The Lemon Tree Hotel',
    2021,
    ['comedy'],
    97,
    'A family-run hotel with one guest, one lemon tree and far too many staff.',
  ],
  [
    'Signal from Vega',
    2023,
    ['scifi', 'adventure'],
    138,
    'An amateur astronomer decodes a message that seems addressed to her mother.',
  ],
  [
    'Rooftop Radio',
    2017,
    ['romance', 'comedy'],
    106,
    'Neighbours who only know each other through a pirate radio show finally meet.',
  ],
  [
    'Ink Fish',
    2022,
    ['animation', 'comedy'],
    88,
    'A squid who draws with his own ink wants to be a famous painter.',
  ],
  [
    'Paper Tigers of Pasig',
    2025,
    ['comedy', 'crime'],
    110,
    'Three retired con artists come back for one last, very polite job.',
  ],
  [
    'The Long Way to Calla',
    2019,
    ['drama', 'adventure'],
    118,
    'A father and daughter take the slowest possible route to her new university.',
  ],
  [
    'Frost on the Window',
    2020,
    ['romance', 'drama'],
    102,
    'Letters left in a frosted window start a winter-long correspondence.',
  ],
  [
    'Hollow Pines',
    2023,
    ['horror', 'thriller'],
    99,
    'A camping trip goes wrong when the trail markers start pointing back.',
  ],
  [
    'Second Breakfast Club',
    2024,
    ['comedy'],
    94,
    'Five office workers bond over a secret 10 a.m. meal in the supply closet.',
  ],
  [
    "The Clockmaker's Rival",
    2016,
    ['mystery', 'crime'],
    116,
    'Two rival clockmakers, one stolen pocket watch, and a town that runs late.',
  ],
  [
    'Seventeen Umbrellas',
    2021,
    ['romance'],
    100,
    'A lost-and-found clerk returns seventeen umbrellas to their owners and meets one twice.',
  ],
  [
    'Map of the Tides',
    2025,
    ['documentary'],
    89,
    'A year with the fishers who still read the sea without an app.',
  ],
  [
    'Starlit Diner',
    2026,
    ['comedy', 'romance'],
    105,
    'A roadside diner holds a contest to name its new pie, and two rivals both enter.',
  ],
];
const SERIES: Row[] = [
  [
    'Harbor Lights',
    2022,
    ['drama', 'mystery'],
    48,
    'Each season, a different family in a harbor town guards a different secret.',
    3,
  ],
  ['The Monday Club', 2023, ['comedy'], 26, 'A support group for people who genuinely love Mondays.', 2],
  ['Quiet Planet', 2021, ['documentary'], 52, 'The slowest, softest nature series ever filmed.', 1],
  [
    'Neon Alley',
    2024,
    ['crime', 'thriller'],
    45,
    'A night-market food stall doubles as an informant network.',
    2,
  ],
  [
    'Kitchen at the End of the World',
    2020,
    ['comedy', 'drama'],
    30,
    'A tiny research-station kitchen feeds twelve scientists and their grudges.',
    4,
  ],
  [
    'Wildflower Station',
    2025,
    ['scifi', 'drama'],
    50,
    'A space station grows the last wildflowers, and someone keeps picking them.',
    1,
  ],
  [
    'The Lighthouse Keepers',
    2019,
    ['mystery'],
    44,
    'Two keepers, one island, and a logbook in someone else’s handwriting.',
    2,
  ],
  [
    'Paper Planes Academy',
    2023,
    ['animation', 'comedy'],
    22,
    'A flight school for paper planes and one very nervous origami crane.',
    3,
  ],
  [
    'Ghosts of Rizal Street',
    2022,
    ['horror', 'comedy'],
    35,
    'A boarding house where the ghosts are the most reasonable tenants.',
    2,
  ],
  [
    'Second Chances Bakery',
    2024,
    ['romance', 'comedy'],
    40,
    'Exes keep accidentally applying to work at the same bakery.',
    2,
  ],
];

function toTitle(row: Row, i: number, mediaType: MediaType): Title {
  const [title, year, genreIds, runtime, overview, seasons] = row;
  const castCount = 3 + (i % 3);
  return {
    id: `t-${String(i + 1).padStart(2, '0')}`,
    tmdbId: 100000 + i,
    mediaType,
    source: 'tmdb',
    title,
    year,
    overview,
    posterUrl: null,
    runtimeMinutes: runtime,
    seasons: seasons ?? null,
    genres: genreIds.map((g) => GENRES.find((x) => x.id === `g-${g}`)!),
    cast: Array.from({ length: castCount }, (_, k) => {
      const p = (i * 5 + k * 7) % CAST_POOL.length;
      return { id: `p-${p}`, name: CAST_POOL[p] };
    }),
  };
}

export const TITLES: Title[] = [
  ...MOVIES.map((r, i) => toTitle(r, i, 'movie')),
  ...SERIES.map((r, i) => toTitle(r, i + MOVIES.length, 'tv')),
];

const tid = (n: number) => `t-${String(n).padStart(2, '0')}`;

// [titleNo, date, viewers ('both' | 'a' | 's'), alexStars, samStars, alexComment, samComment, season]
type S = [number, string, 'both' | 'a' | 's', number, number, string?, string?, number?];
const DATED: S[] = [
  [1, '2026-08-07', 'both', 5, 5, 'the crane scene. ugh.', 'we’re rewatching this every year.'],
  [6, '2026-08-15', 'both', 4, 4, 'cosy and silly.'],
  [9, '2026-08-22', 'both', 3, 4, '', 'the grandson is the best actor here.'],
  [16, '2026-08-19', 'a', 4, 0, 'tense in a good way.'],
  [13, '2026-08-29', 'both', 4, 3],
  [18, '2026-09-01', 'both', 3, 3, 'fine for a tuesday.'],
  [4, '2026-09-05', 'both', 5, 4, 'the fox!!', 'cried at the lantern bit.'],
  [31, '2026-09-12', 'both', 4, 5, 'season one hooked me.', 'more please.', 1],
  [10, '2026-09-19', 'both', 4, 5, '', 'the greenhouse fight is iconic.'],
  [17, '2026-09-16', 's', 0, 2, '', 'too spooky alone.'],
  [21, '2026-09-26', 'both', 4, 4],
  [2, '2026-10-03', 'both', 5, 4, 'that ending.'],
  [25, '2026-10-08', 'a', 2, 0, 'not for me.'],
  [12, '2026-10-17', 'both', 5, 5, 'best sci-fi this year.', 'eleven months, one argument. perfect.'],
  [28, '2026-10-20', 's', 0, 4, '', 'sweet little film.'],
  [32, '2026-10-24', 'both', 3, 4],
  [14, '2026-10-31', 'both', 4, 3, 'the dryer heist lol'],
  [17, '2026-10-31', 'both', 3, 4, '', 'better the second time with company.'],
  [1, '2026-11-07', 'both', 5, 5, 'still perfect.', 'told you.'],
  [24, '2026-11-11', 'a', 4, 0],
  [31, '2026-11-14', 'both', 4, 4, '', 'season two is darker.', 2],
  [36, '2026-11-18', 's', 0, 5, '', 'watch this with me please.'],
  [5, '2026-11-21', 'both', 5, 0, 'the map reveal got me.'],
  [3, '2026-11-22', 'both', 0, 4, '', 'stop 42 forever.'],
];

// [titleNo, watchedYear, alexStars, samStars]
const IMPORTED: [number, number, number, number][] = [
  [8, 2024, 4, 5],
  [11, 2024, 5, 4],
  [20, 2024, 0, 0],
  [27, 2025, 4, 4],
  [35, 2025, 5, 5],
  [23, 2025, 0, 0],
];

// [titleNo, addedBy, addedAt, alexReaction, samReaction]
type R = Reaction | null;
const WATCHLIST: [number, string, string, R, R][] = [
  [19, ALEX, '2026-11-20T12:00:00+08:00', 'want', 'want'],
  [30, SAM, '2026-11-19T21:00:00+08:00', 'want', 'want'],
  [7, ALEX, '2026-11-15T19:30:00+08:00', 'want', 'maybe'],
  [15, SAM, '2026-11-10T20:00:00+08:00', null, 'want'],
  [22, ALEX, '2026-11-02T18:00:00+08:00', 'want', null],
  [34, SAM, '2026-10-28T22:00:00+08:00', 'maybe', 'want'],
  [26, ALEX, '2026-10-21T17:00:00+08:00', 'want', 'nah'],
  [38, SAM, '2026-10-12T10:00:00+08:00', 'maybe', 'want'],
  [29, ALEX, '2026-09-30T09:00:00+08:00', 'want', 'want'],
  [40, SAM, '2026-09-14T16:00:00+08:00', null, 'want'],
];

const avatar = (a: Avatar) => a;

export function buildSeed(version: number): Db {
  const users: DbUser[] = [
    {
      id: ALEX,
      username: 'alex',
      displayName: 'Alex',
      avatar: avatar({ style: 'short', hair: 0, skin: 0, top: 0, extra: 'glasses' }),
      favoriteGenreIds: ['g-scifi', 'g-drama', 'g-mystery'],
      theme: 'light',
      password: SEED_PASSWORD,
      topFive: [],
    },
    {
      id: SAM,
      username: 'sam',
      displayName: 'Sam',
      avatar: avatar({ style: 'long', hair: 1, skin: 1, top: 1, extra: 'none' }),
      favoriteGenreIds: ['g-romance', 'g-comedy', 'g-animation'],
      theme: 'light',
      password: SEED_PASSWORD,
      topFive: [],
    },
  ];

  const screenings: DbScreening[] = [];
  const ratings: DbRating[] = [];
  let number = 0;
  const addRatings = (sid: string, at: string, a: number, s: number, ca?: string, cs?: string) => {
    if (a)
      ratings.push({ screeningId: sid, userId: ALEX, stars: a as Stars, comment: ca || null, updatedAt: at });
    if (s)
      ratings.push({ screeningId: sid, userId: SAM, stars: s as Stars, comment: cs || null, updatedAt: at });
  };

  IMPORTED.forEach(([t, year, a, s], i) => {
    number += 1;
    const id = `s-imp-${i + 1}`;
    const at = '2026-11-01T10:00:00+08:00';
    screenings.push({
      id,
      number,
      titleId: tid(t),
      watchedOn: null,
      watchedYear: year,
      datePrecision: 'year',
      season: null,
      viewerIds: [ALEX, SAM],
      source: 'import',
      addedBy: ALEX,
      createdAt: at,
    });
    addRatings(id, at, a, s);
  });

  [...DATED]
    .sort((x, y) => x[1].localeCompare(y[1]))
    .forEach(([t, date, who, a, s, ca, cs, season], i) => {
      number += 1;
      const id = `s-${String(i + 1).padStart(2, '0')}`;
      const at = `${date}T22:00:00+08:00`;
      const viewerIds = who === 'both' ? [ALEX, SAM] : who === 'a' ? [ALEX] : [SAM];
      screenings.push({
        id,
        number,
        titleId: tid(t),
        watchedOn: date,
        watchedYear: Number(date.slice(0, 4)),
        datePrecision: 'day',
        season: season ?? null,
        viewerIds,
        source: 'app',
        addedBy: who === 's' ? SAM : i % 2 ? SAM : ALEX,
        createdAt: at,
      });
      addRatings(id, at, a, s, ca, cs);
    });

  const byTitle = (n: number) => screenings.find((s) => s.titleId === tid(n))!.id;
  users[0].topFive = [byTitle(12), byTitle(1), byTitle(2), byTitle(5), byTitle(4)];
  users[1].topFive = [byTitle(1), byTitle(10), byTitle(12), byTitle(36), null];

  const watchlist: DbWatchlistItem[] = WATCHLIST.map(([t, by, at, ra, rs], i) => ({
    id: `w-${String(i + 1).padStart(2, '0')}`,
    titleId: tid(t),
    addedBy: by,
    addedAt: at,
    reactions: [
      ...(ra ? [{ userId: ALEX, reaction: ra }] : []),
      ...(rs ? [{ userId: SAM, reaction: rs }] : []),
    ],
  }));

  return {
    version,
    users,
    genres: GENRES,
    titles: TITLES.map((t) => structuredClone(t)),
    screenings,
    ratings,
    watchlist,
    nights: [
      {
        id: 'n-1',
        titleId: tid(30),
        proposedBy: SAM,
        date: '2026-11-28',
        status: 'proposed',
        createdAt: '2026-11-23T20:00:00+08:00',
      },
    ],
    importRows: [],
    note: {
      mood: '★ movie mood',
      statusNote: 'saving the new sci-fi one for saturday. no spoilers!!',
      history: [{ text: 'rewatching paper moons again, obviously', at: '2026-11-07T21:00:00+08:00' }],
    },
    bestStreak: 9,
    recRotation: 0,
    loginFails: { count: 0, until: null },
  };
}

import type { Services } from '../contracts';
import { authHttp } from './auth.http';
import { browseHttp } from './browse.http';
import { homeHttp } from './home.http';
import { importHttp } from './import.http';
import { meHttp } from './me.http';
import { movieNightsHttp } from './movieNights.http';
import { moviesHttp } from './movies.http';
import { projectionistHttp } from './projectionist.http';
import { recommendationsHttp } from './recommendations.http';
import { screeningsHttp } from './screenings.http';
import { statsHttp } from './stats.http';
import { usersHttp } from './users.http';
import { watchlistHttp } from './watchlist.http';

export const httpServices: Services = {
  auth: authHttp,
  users: usersHttp,
  me: meHttp,
  home: homeHttp,
  movies: moviesHttp,
  browse: browseHttp,
  recommendations: recommendationsHttp,
  screenings: screeningsHttp,
  stats: statsHttp,
  watchlist: watchlistHttp,
  movieNights: movieNightsHttp,
  import: importHttp,
  projectionist: projectionistHttp,
};

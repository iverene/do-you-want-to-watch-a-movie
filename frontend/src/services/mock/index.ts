import type { Services } from '../contracts';
import { authMock } from './auth.mock';
import { browseMock } from './browse.mock';
import { homeMock } from './home.mock';
import { importMock } from './import.mock';
import { meMock } from './me.mock';
import { movieNightsMock } from './movieNights.mock';
import { moviesMock } from './movies.mock';
import { projectionistMock } from './projectionist.mock';
import { recommendationsMock } from './recommendations.mock';
import { screeningsMock } from './screenings.mock';
import { statsMock } from './stats.mock';
import { usersMock } from './users.mock';
import { watchlistMock } from './watchlist.mock';

export { resetDb } from './db';

export const mockServices: Services = {
  auth: authMock,
  users: usersMock,
  me: meMock,
  home: homeMock,
  movies: moviesMock,
  browse: browseMock,
  recommendations: recommendationsMock,
  screenings: screeningsMock,
  stats: statsMock,
  watchlist: watchlistMock,
  movieNights: movieNightsMock,
  import: importMock,
  projectionist: projectionistMock,
};

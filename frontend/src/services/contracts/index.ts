import type { AuthService } from './auth';
import type { BrowseService } from './browse';
import type { HomeService } from './home';
import type { ImportService } from './import';
import type { LikesService } from './likes';
import type { MeService } from './me';
import type { MovieNightsService } from './movieNights';
import type { MoviesService } from './movies';
import type { ProjectionistService } from './projectionist';
import type { RecommendationsService } from './recommendations';
import type { ScreeningsService } from './screenings';
import type { StatsService } from './stats';
import type { UsersService } from './users';
import type { WatchlistService } from './watchlist';

export type {
  AuthService,
  BrowseService,
  HomeService,
  ImportService,
  LikesService,
  MeService,
  MovieNightsService,
  MoviesService,
  ProjectionistService,
  RecommendationsService,
  ScreeningsService,
  StatsService,
  UsersService,
  WatchlistService,
};

/** The full set of services. Both `mockServices` and `httpServices` implement this. */
export interface Services {
  auth: AuthService;
  users: UsersService;
  me: MeService;
  home: HomeService;
  movies: MoviesService;
  likes: LikesService;
  browse: BrowseService;
  recommendations: RecommendationsService;
  screenings: ScreeningsService;
  stats: StatsService;
  watchlist: WatchlistService;
  movieNights: MovieNightsService;
  import: ImportService;
  projectionist: ProjectionistService;
}

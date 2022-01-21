import dayjs from 'dayjs';

const SortType = {
  DEFAULT: 'day-down',
  PRICE_DOWN: 'price-down',
  DURATION_DOWN: 'duration-down',
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PAST: 'past',
};

const UserAction = {
  UPDATE_EVENT: 'UPDATE_EVENT',
  ADD_EVENT: 'ADD_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

const MenuItem = {
  TABLE: 'table',
  STATS: 'stats',
};

const DEFAULT_EVENT = {
  basePrice: '',
  dateFrom: dayjs(),
  dateTo: dayjs(),
  destination: {
    description: '',
    name: '',
    pictures: [],
  },
  id: 80,
  isFavorite: true,
  offers: [],
  type: 'taxi',
};

const WAYPOINT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

export { SortType, UserAction, UpdateType, FilterType, MenuItem, DEFAULT_EVENT, WAYPOINT_TYPES };

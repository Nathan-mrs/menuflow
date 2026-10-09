import { getRestaurant, changeRestaurant } from '../models/restaurant.js';
import * as sessions from '../models/session.js';
import { createApi } from './apiCore.js';
export const api = createApi({ getRestaurant, changeRestaurant, ...sessions });

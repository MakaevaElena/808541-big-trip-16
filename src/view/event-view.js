import dayjs from 'dayjs';
import { createDateTemplate, createOffersTemplate } from './utils-view';
import { createElement } from '../utils/render.js';

const createTypeIconTemplate = (type) =>
  `<div class="event__type">
    <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
  </div>`;

const createTitleTemplate = (type, destination) => `<h3 class="event__title">${type} ${destination}</h3>`;

const createScheduleTemplate = (dateFrom, dateTo) => {
  const timeFrom = dayjs(dateFrom).format('HH:mm');
  const timeTo = dayjs(dateTo).format('HH:mm');
  // https://day.js.org/docs/ru/display/difference
  // нужно разделить duration на '01H 35M'
  const duration = dayjs(dateTo).diff(dayjs(dateFrom), 'm');

  return ` <div class="event__schedule">
<p class="event__time">
  <time class="event__start-time" datetime="${dateFrom}">${timeFrom}</time>
  &mdash;
  <time class="event__end-time" datetime="${dateTo}">${timeTo}</time>
</p>
<p class="event__duration">${duration}M</p>
</div>`;
};

const createFavoriteTemplate = (isFavorite) => {
  const isFavoriteClass = isFavorite
    ? 'event__favorite-btn event__favorite-btn--active'
    : 'event__favorite-btn';
  return ` <button class="${isFavoriteClass}" type="button">
<span class="visually-hidden">Add to favorite</span>
<svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
  <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
</svg>
</button>`;
};

const createEventTemplate = (someEvent) => {
  const {
    type,
    offers,
    destination,
    dateFrom,
    dateTo,
    isFavorite,
    basePrice,
  } = someEvent;

  // console.log("dateFrom: " + dateFrom, "dateTo: " + dateTo);

  return `<li class="trip-events__item">
  <div class="event">

    <time class="event__date" datetime="${dateFrom}">${createDateTemplate(dateFrom, 'MMM D')}</time>

    ${createTypeIconTemplate(type)}

    ${createTitleTemplate(type, destination.name)}

    ${createScheduleTemplate(dateFrom, dateTo)}

    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
    </p>

    <h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
     ${createOffersTemplate(offers)}
    </ul>

    ${createFavoriteTemplate(isFavorite)}

    <button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>
  </div>
</li>`;
};

export default class EventView {
  #element = null;
  #event = null;

  constructor(event) {
    this.#event = event;
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  get template() {
    return createEventTemplate(this.#event);
  }

  removeElement() {
    this.#element = null;
  }
}


import { render, RenderPosition, remove } from '../utils/render.js';
// import { updateItem } from '../utils/common.js';
import { sortDateDown, sortDurationDown, sortPriceDown } from '../utils/event-utils.js';
import { SortType, UpdateType, UserAction, FilterType } from '../const.js';
import { filter } from '../utils/filter.js';
import EventNewPresenter from './event-new-presenter.js';

import EventsListView from '../view/events-list-view.js';
import SortView from '../view/sort-view.js';
import NoEventsView from '../view/new-event-view.js';
import MenuView from '../view/menu-view.js';
import TripInfoView from '../view/trip-info-view.js';
import CostView from '../view/cost-view.js';
import EventPresenter from './event-presenter.js';

export default class TripPresenter {
  #tripMainContainer = null;
  #tripMenuContainer = null;
  #tripEventsContainer = null;
  #eventsModel = null;
  #sortComponent = null;
  #filterModel = null;

  #tripInfoComponent = new TripInfoView();
  #costComponent = new CostView();
  #menuComponent = new MenuView();

  // #sortComponent = new SortView(SortType.DEFAULT);
  #eventsListComponent = new EventsListView();
  #noEventsComponent = null;

  // #events = [];
  #eventPresenter = new Map();
  #currentSortType = SortType.DEFAULT;
  #filterType = FilterType.ALL;
  // #sourcedEvents = [];
  #eventNewPresenter = null;

  constructor(tripMainContainer, tripEventsContainer, tripMenuContainer, eventsModel, filterModel) {
    this.#tripMainContainer = tripMainContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripMenuContainer = tripMenuContainer;
    this.#eventsModel = eventsModel;
    this.#filterModel = filterModel;

    this.#eventNewPresenter = new EventNewPresenter(this.#eventsListComponent, this.#handleViewAction);
    this.#eventsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get events() {
    this.#filterType = this.#filterModel.filter;
    const events = this.#eventsModel.tasks;
    const filteredEvents = filter[this.#filterType](events);

    switch (this.#currentSortType) {
      case SortType.DEFAULT:
        return filteredEvents.sort(sortDateDown);
      case SortType.DURATION_DOWN:
        return filteredEvents.sort(sortDurationDown);
      case SortType.PRICE_DOWN:
        return filteredEvents.sort(sortPriceDown);
    }
    return filteredEvents;
  }

  init = () => {
    // this.#events = [...events];
    // this.#sourcedEvents = [...events];

    this.events.sort(sortDateDown);
    this.#renderBoard();

  }

  createEvent = () => {
    this.#currentSortType = SortType.DEFAULT;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.ALL);
    this.#eventNewPresenter.init();
  }

  #handleModeChange = () => {
    this.#eventNewPresenter.destroy();
    this.#eventPresenter.forEach((presenter) => presenter.resetView());
  }

  // #handleEventChange = (updatedEvent) => {
  // this.#events = updateItem(this.#events, updatedEvent);
  // this.#sourcedEvents = updateItem(this.#sourcedEvents, updatedEvent);
  // Здесь будем вызывать обновление модели
  // this.#eventPresenter.get(updatedEvent.id).init(updatedEvent);
  // }

  #handleViewAction = (actionType, updateType, update) => {
    // console.log(actionType, updateType, update);
    // Здесь будем вызывать обновление модели.
    // actionType - действие пользователя, нужно чтобы понять, какой метод модели вызвать
    // updateType - тип изменений, нужно чтобы понять, что после нужно обновить
    // update - обновленные данные
    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventsModel.updateTask(updateType, update);
        break;

      case UserAction.ADD_EVENT:
        this.#eventsModel.addTask(updateType, update);
        break;

      case UserAction.DELETE_EVENT:
        this.#eventsModel.deleteTask(updateType, update);
        break;
    }
  }

  #handleModelEvent = (updateType, data) => {
    // console.log(updateType, data);
    // В зависимости от типа изменений решаем, что делать:
    // - обновить часть списка (например, когда поменялось описание)
    // - обновить список (например, когда задача ушла в архив)
    // - обновить всю доску (например, при переключении фильтра)
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка (например, когда поменялось описание)
        this.#eventPresenter.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        // - обновить список (например, когда задача ушла в архив)
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску (например, при переключении фильтра)
        this.#clearBoard({ resetRenderedEventCount: true, resetSortType: true });
        this.#renderBoard();
        break;
    }
  }

  // #sortEvents = (sortType) => {
  //   switch (sortType) {
  //     case SortType.DEFAULT:
  //       this.#events.sort(sortDateDown);
  //       break;
  //     case SortType.DURATION_DOWN:
  //       this.#events.sort(sortDurationDown);
  //       break;
  //     case SortType.PRICE_DOWN:
  //       this.#events.sort(sortPriceDown);
  //       break;
  //     default:
  //       this.#events = [...this.#sourcedEvents];
  //   }
  //   this.#currentSortType = sortType;
  // }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    // this.#sortEvents(sortType);
    this.#currentSortType = sortType;

    // this.#clearEvents();
    // this.#renderEvents();
    this.#clearBoard({ resetRenderedEventsCount: true });
    this.#renderBoard();
  }

  #renderMenuButtons = () => {
    render(this.#tripMenuContainer, this.#menuComponent, RenderPosition.BEFOREEND);
  };

  #renderSort = () => {
    // render(this.#tripEventsContainer, this.#sortComponent, RenderPosition.AFTERBEGIN);
    this.#sortComponent = new SortView(this.#currentSortType);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#tripEventsContainer, this.#sortComponent, RenderPosition.AFTERBEGIN);
  }

  #renderNoEvents = () => {
    this.#noEventsComponent = new NoEventsView(this.#filterType);
    render(this.#tripEventsContainer, this.#noEventsComponent, RenderPosition.BEFOREEND);
  }

  #renderPriceAndRoute = () => {
    render(this.#tripMainContainer, this.#tripInfoComponent, RenderPosition.AFTERBEGIN);
    render(this.#tripInfoComponent, this.#costComponent, RenderPosition.BEFOREEND);
  }

  // #clearEvents = () => {
  //   this.#eventPresenter.forEach((presenter) => presenter.destroy());
  //   this.#eventPresenter.clear();
  // }

  #clearBoard = ({ resetSortType = false } = {}) => {
    this.#eventNewPresenter.destroy();
    this.#eventPresenter.forEach((presenter) => presenter.destroy());
    this.#eventPresenter.clear();

    remove(this.#sortComponent);
    // remove(this.#noEventsComponent);

    if (this.#noEventsComponent) {
      remove(this.#noEventsComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
    }
  }

  #renderListEvent = () => {
    render(this.#tripEventsContainer, this.#eventsListComponent, RenderPosition.BEFOREEND);
  }

  #renderEvent = (event) => {
    // const eventPresenter = new EventPresenter(this.#eventsListComponent, this.#handleEventChange, this.#handleModeChange);
    const eventPresenter = new EventPresenter(this.#eventsListComponent, this.#handleViewAction, this.#handleModeChange);
    eventPresenter.init(event);
    this.#eventPresenter.set(event.id, eventPresenter);
  }

  // #renderEvents = (from, to) => {
  //   this.#events
  //     .slice(from, to)
  //     .forEach((event) => this.#renderEvent(event));
  // }
  #renderEvents = (events) => {
    events.forEach((event) => this.#renderEvent(event));
  }

  #renderBoard = () => {
    const events = this.events;
    const eventsCount = events.length;
    this.#renderPriceAndRoute();
    this.#renderMenuButtons();
    if (eventsCount === 0) {
      this.#renderNoEvents();
      return;
    }
    this.#renderSort();
    this.#renderListEvent();
    this.#renderEvents();

  }
}

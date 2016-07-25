import { combineReducers } from 'redux'
import { handleActions as makeReducer } from 'redux-actions'
import { routerReducer } from 'react-router-redux'
import { norcalMtb2016Events, testRoadEvents2016 } from 'client/temp/events.js'
import { createSelector } from 'reselect'

//TODO bc: set calendar ID to every event
const toByIdMap = objects => objects.reduce((map, x) => {
  map[x.id] = x
  return map
}, {})

const toArrayOfIds = objects => objects.map(x => x.id)

const testRoadEventIds = toArrayOfIds(testRoadEvents2016)

const initialState = {
  app: {
    containerWidth: null,
  },
  debug: {
    showBaseline: false,
    show3x3Grid: false,
    showContainerEdges: false,
  },

  events: toByIdMap(norcalMtb2016Events.concat(testRoadEvents2016)),

  //calenars map by id
  calendars: {
    ['cal-norcal-mtb-2016']: {
      showPastEvents: false,
      eventsIds: toArrayOfIds(norcalMtb2016Events)
    },
    ['cal-0']: {
      // name: 'NorCal MTB Calendar 2016 =)',
      showPastEvents: false,
      //eventIds: ['evnt-1', 'evnt-2']
    },
    ['cal-test-1']: { eventsIds: testRoadEventIds },
    ['cal-test-2']: { eventsIds: testRoadEventIds },
    ['cal-test-3']: { eventsIds: testRoadEventIds },
    ['cal-test-4']: { eventsIds: testRoadEventIds },
  }
}


export const calendars = makeReducer({
  ['Cal.TOGGLE_PAST_EVENTS']: (state, action) => {
    const calendarId = action.payload.calendarId
    const calendar = state[calendarId]

    if (calendar) {
      return {
        ...state,
        [calendarId] : {
          ...calendar,
          showPastEvents: !calendar.showPastEvents
        }
      }
    } else {
      throw new Error(`No calendar corresponding to id: ${calendarId}`)
    }
  }
}, initialState.calendars)


export const debug = makeReducer({
  ['Dbg.TOGGLE_BASELINE']: (state, action) => ({...state, showBaseline: !state.showBaseline}),
  ['Dbg.TOGGLE_3X3_GRID']: (state, action) => ({...state, show3x3Grid: !state.show3x3Grid}),
  ['Dbg.TOGGLE_CONTAINER_EDGES']: (state, action) => ({...state, showContainerEdges: !state.showContainerEdges}),
}, initialState.debug)

export const events = (prevState = initialState.events, action) => prevState

const rootReducer = combineReducers({
  debug,
  calendars,
  events,
  routing: routerReducer,
})


//TODO bc: this is a a copy from events.js, refactor!
const eventsToMapByDate = events => {
  const eventsMap = new Map()

  events.forEach(event => {
    const key = event.datePlain || event.date.format('MMDDYYYY')

    if (eventsMap.get(key)) {
      eventsMap.get(key).push(event)
    } else {
      eventsMap.set(key, [event])
    }
  })

  return eventsMap
}


let eventsByDate = function(events) {
  const eventsMap = eventsToMapByDate(events)

  const getTotalFrom = date => {
    let total = 0

    eventsMap.forEach((value, key, map) => {
      const events = value
      //taking date of first event since the rest is after it
      const eventsDate = events[0].date
      const eventsCount = events.length

      if (date.diff(eventsDate, 'days') <= 0) {
        total += eventsCount
      }
    })

    return total
  }

  return {
    map: eventsMap,
    total: events.length,

    //TODO bc: write test for getTotalFrom
    getTotalFrom: getTotalFrom
  }
}


const getCalendar = (state, props) => state.calendars[props.calendarId]
const getAllEvents = state => state.events
const getEventIdsForCalendar = (state, props) => getCalendar(state, props).eventsIds

const getEventsByDateForCalendar = createSelector(
  getEventIdsForCalendar,
  getAllEvents,
  (eventIds, allEvents) => eventsByDate(eventIds.map(id => allEvents[id]))
)

export {
  getCalendar,
  getEventsByDateForCalendar
}

export default rootReducer

import App from './App'
import { EventName, EventPayload, EventSpec, EventHandler } from './types'

export default (
  eventName: EventName,
  payload: EventPayload,
  {
    state,
    action,
    update,
  }: EventSpec,
  app: App
) : ReturnType<EventHandler> => {
  let dbView, currentState, actionReturnValue, changes
  if (state && (action || update)) {
    dbView = app.dbView(state, payload)
    currentState = dbView.pull()
  }
  if (action) {
    actionReturnValue = action(payload, app.dispatch, currentState)
  }
  
  if (update) {
    if (!dbView || !currentState) {
      throw new Error(`'update' needs the state to be specified`)
    }
    dbView.push(update(currentState, payload))
    changes = app.commitUpdates()
  }
  return {
    changes,
    actionReturnValue,
  }
}

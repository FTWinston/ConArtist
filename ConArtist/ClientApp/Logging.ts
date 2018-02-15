import { Action, Middleware } from 'redux';

export const loggingMiddleware: Middleware = store => next => async <A extends Action>(action: A) => {
    console.group(action.type)
    console.info('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    console.groupEnd()
    return result
}
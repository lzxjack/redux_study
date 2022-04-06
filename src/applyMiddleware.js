import compose from './compose';

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return createStore =>
    (...args) => {
      // 创建一个store
      const store = createStore(...args);
      // 定义一个dispatch，如果在中间件构造过程中调用，则抛出错误
      let dispatch = () => {
        throw new Error(
          'Dispatching while constructing your middleware is not allowed. ' +
            'Other middleware would not be applied to this dispatch.'
        );
      };

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      };
      // 依次调用middleware，存放在chain
      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      // 用compose整合chain数组，并赋值给dispatch
      dispatch = compose(...chain)(store.dispatch);

      return {
        ...store,
        dispatch
      };
    };
}

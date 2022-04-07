import compose from './compose';

export default function applyMiddleware(...middlewares) {
  // 返回一个参数为createStore的函数
  return createStore =>
    (...args) => {
      // 创建store
      const store = createStore(...args);
      // 定义一个dispatch，如果在中间件构造过程中调用，则抛出错误
      let dispatch = () => {
        throw new Error(
          'Dispatching while constructing your middleware is not allowed. ' +
            'Other middleware would not be applied to this dispatch.'
        );
      };

      // 在中间件中要用到的两个方法
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      };
      // 依次调用middleware，存放在chain数组中
      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      // 用compose整合chain数组，并赋值给dispatch
      dispatch = compose(...chain)(store.dispatch);

      // 返回增强的store
      return {
        ...store,
        dispatch
      };
    };
}

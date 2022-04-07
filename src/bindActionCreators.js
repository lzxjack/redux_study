import { kindOf } from './utils/kindOf';

// actionCreator是产生action的函数，执行之后，会得到一个action
// 得到的action再传递给dispatch
// bindActionCreator函数返回一个自动执行dispatch的方法
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass an action creator as the first argument,
 * and get a dispatch wrapped function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */

//  actionCreators：创造action的函数对象
export default function bindActionCreators(actionCreators, dispatch) {
  // 如果是一个函数，直接执行bindActionCreator并返回
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  // 错误处理
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, but instead received: '${kindOf(
        actionCreators
      )}'. ` +
        `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    );
  }

  const boundActionCreators = {};
  // 遍历每个函数
  for (const key in actionCreators) {
    // 拿到每个函数
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      // 将自动执行dispatch的方法放到boundActionCreators中
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

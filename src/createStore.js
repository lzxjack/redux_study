import $$observable from './utils/symbol-observable';

import ActionTypes from './utils/actionTypes';
import isPlainObject from './utils/isPlainObject';
import { kindOf } from './utils/kindOf';

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function createStore(reducer, preloadedState, enhancer) {
  // 判断是否传入多个enhancer
  // 确保只传入一个enhancer
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.'
    );
  }

  // 若第二个参数是函数，且没有传入第三个参数
  // 则第二个参数看作为enhancer，preloadedState不传入
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  // 首先若传入了enhancer，则返回增强后的createStore
  if (typeof enhancer !== 'undefined') {
    // 确保enhancer是函数
    if (typeof enhancer !== 'function') {
      throw new Error(
        `Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`
      );
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  // 确保reducer是函数，若不是函数，显示其类型
  if (typeof reducer !== 'function') {
    throw new Error(
      `Expected the root reducer to be a function. Instead, received: '${kindOf(
        reducer
      )}'`
    );
  }

  // 当前的reducer
  let currentReducer = reducer;
  // 当前的state
  let currentState = preloadedState;
  // 当前订阅者列表
  let currentListeners = [];
  let nextListeners = currentListeners;
  // 锁，保证数据一致性
  let isDispatching = false;

  // 当nextListeners和currentListeners是同一个引用时，
  // 将currentListeners的拷贝赋值给nextListeners
  // 防止当前队列执行的时候，影响到自身
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  // 直接返回当前的state
  // （可以直接修改currentState，但不会通知订阅者）
  function getState() {
    // 确保没有其他reducer操作
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      );
    }

    return currentState;
  }

  // 添加订阅者
  // 返回取消订阅的函数
  function subscribe(listener) {
    // 确保listener是个函数
    if (typeof listener !== 'function') {
      throw new Error(
        `Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`
      );
    }

    // 确保数据唯一性
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api/store#subscribelistener for more details.'
      );
    }

    // 该订阅者在订阅状态
    let isSubscribed = true;

    // 若nextListeners和currentListeners为同一个引用
    // 将currentListeners作一次浅拷贝，给nextListeners
    // ？？？
    ensureCanMutateNextListeners();
    // 新的订阅者加入订阅者列表中
    nextListeners.push(listener);

    // 返回取消订阅的函数
    return function unsubscribe() {
      // 若已经取消订阅，不继续执行
      if (!isSubscribed) {
        return;
      }

      // 保证数据唯一性
      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api/store#subscribelistener for more details.'
        );
      }

      // 取消订阅
      isSubscribed = false;

      ensureCanMutateNextListeners();
      // 将该订阅者从订阅者列表中删除
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  // 分派action，这是触发state更新的唯一方法
  // action仅支持简单对象，若action是Promise、Observable等，需要使用中间件
  // action表明了做了什么改变，必须有type属性，并且非undefined，一个好的实践为type是字符串常量
  // 返回dispatch的action，若使用了中间件，可能返回其他
  function dispatch(action) {
    // 确保action是简单对象
    if (!isPlainObject(action)) {
      throw new Error(
        `Actions must be plain objects. Instead, the actual type was: '${kindOf(
          action
        )}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`
      );
    }

    // 确保action.type存在
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
      );
    }

    // 确保当前没有在执行其他的reducer操作
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      // 加锁，防止后续的reducer操作
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      // 无论是否有错误，都会执行的语句
      // 当前reducer执行完毕后，解锁
      isDispatching = false;
    }

    // 通知订阅者
    // currentListeners = nextListeners是为了下一次执行的时候，会重新生成一个新的拷贝
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      // 执行订阅者的函数，不传入参数
      const listener = listeners[i];
      listener();
    }

    // 最后返回当前的action
    return action;
  }

  // 替换reducer
  // 使用场景：
  // 1. 代码分割，立即加载reducers的时候
  // 2. 实现redux热加载机制的时候
  function replaceReducer(nextReducer) {
    // 确保nextReducer是函数
    if (typeof nextReducer !== 'function') {
      throw new Error(
        `Expected the nextReducer to be a function. Instead, received: '${kindOf(
          nextReducer
        )}`
      );
    }

    // 替换reducer
    currentReducer = nextReducer;

    // 触发state更新
    dispatch({ type: ActionTypes.REPLACE });
  }

  // 一般用不到
  function observable() {
    const outerSubscribe = subscribe;
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError(
            `Expected the observer to be an object. Instead, received: '${kindOf(
              observer
            )}'`
          );
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return { unsubscribe };
      },

      [$$observable]() {
        return this;
      }
    };
  }

  // 初始化state，否则第一次的currentState为undefined
  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  };
}

import ActionTypes from './utils/actionTypes';
import warning from './utils/warning';
import isPlainObject from './utils/isPlainObject';
import { kindOf } from './utils/kindOf';

function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  const reducerKeys = Object.keys(reducers);
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    );
  }

  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "${kindOf(
        inputState
      )}". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    );
  }

  // 找出state里没有对应reducer的key
  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  );

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true;
  });

  // 如果是替换reducer的action，则提前退出，不打印异常
  if (action && action.type === ActionTypes.REPLACE) return;

  // 打印所有异常的key
  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    );
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key];
    const initialState = reducer(undefined, { type: ActionTypes.INIT });

    // 确保初始值不为undefined
    if (typeof initialState === 'undefined') {
      throw new Error(
        `The slice reducer for key "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      );
    }

    // 确保遇到未知的action，返回初始值，并且不为undefined
    // 确保没有占用redux的命名空间
    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined'
    ) {
      throw new Error(
        `The slice reducer for key "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle '${ActionTypes.INIT}' or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined, but can be null.`
      );
    }
  });
}

// 合并多个reducer为单个reducer
// 输入参数reducers是一个对象，值是需要合并的reducer
// 会调用所有的子reducer，聚合所有结果合并为一个object
// 返回合并后的单个reducer
export default function combineReducers(reducers) {
  // reducers对象的key数组
  const reducerKeys = Object.keys(reducers);
  // 最终要返回的reducer
  const finalReducers = {};

  // 遍历key数组，浅拷贝reducers
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];

    // 若开发环境，且当前reducer函数名不再存在
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`);
      }
    }

    // 当前reducer是函数，添加到finalReducers中
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  // 获取finalReducers的所有key
  const finalReducerKeys = Object.keys(finalReducers);

  // 确保不警告多次相同的key
  let unexpectedKeyCache;
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {};
  }

  let shapeAssertionError;
  try {
    // 确保所有reducers遇到未知的action，返回初始值，且不为undefined
    // 确保没有占用redux命名空间
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state = {}, action) {
    // 错误信息
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    // 生产环境，找出state里面没有对应reducer的key，给出提示
    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      );
      if (warningMessage) {
        warning(warningMessage);
      }
    }

    // 表示state是否已被更改
    let hasChanged = false;
    // 改变后的state
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      // 对新的state做undefined检验
      if (typeof nextStateForKey === 'undefined') {
        const actionType = action && action.type;
        throw new Error(
          `When called with an action of type ${
            actionType ? `"${String(actionType)}"` : '(unknown type)'
          }, the slice reducer for key "${key}" returned undefined. ` +
            `To ignore an action, you must explicitly return the previous state. ` +
            `If you want this reducer to hold no value, you can return null instead of undefined.`
        );
      }
      nextState[key] = nextStateForKey;
      // 若state发生变化，则肯定已经改变
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    // 发生变化则返回nextState，否则返回state
    return hasChanged ? nextState : state;
  };
}

function Maybe(the_thing) {
  if (the_thing === null || the_thing === undefined || the_thing.is_nothing) {
    return Nothing();
  }

  if (the_thing.is_future || the_thing.is_just) {
    return the_thing;
  }

  return Just(the_thing);
}

function Just(thing) {
  return {
    map: fun => Maybe(fun(thing)),
    and_then: fun => fun(thing),
    or_else: () => Just(thing),
    tap: fun => (fun(thing), Just(thing)),
    unwrap_or: () => thing,

    filter: predicate_fun => (predicate_fun(thing) ? Maybe(thing) : Nothing()),

    is_just: true,
    is_nothing: false,
    is_future: false,
    inspect: () => `Just(${thing})`
  };
}

function Nothing() {
  return {
    map: Nothing,
    and_then: Nothing,
    or_else: fun => fun(),
    tap: Nothing,
    unwrap_or: arg => arg,

    filter: Nothing,

    is_just: false,
    is_nothing: true,
    is_future: false,
    inspect: () => `Nothing`
  };
}

function Future(promise_thing) {
  return {
    map: fun => Future(promise_thing.then(map_future(fun))),
    and_then: fun => Future(promise_thing.then(map_future(fun))),
    or_else: fun => Future(promise_thing.catch(fun)),
    tap: fun => Future(promise_thing.then(val => (fun(val), val))),
    unwrap_or: arg => promise_thing.catch(val => arg),

    filter: fun => Future(promise_thing.then(filter_future(fun))),

    is_just: false,
    is_nothing: false,
    is_future: true,
    inspect: () => `<Promise>`
  };
}

Future.from_val = function(val) {
  return Future(Promise.resolve(val));
};

function map_future(fun) {
  return val => {
    let promise_content = val;

    if (Maybe(promise_content).is_nothing) {
      Promise.reject();
      return;
    }

    if (promise_content.is_just) {
      promise_content = val.unwrap_or();
    }

    const result = Maybe(fun(promise_content));

    if (result.is_just) {
      return result.unwrap_or();
    }

    return Promise.reject();
  };
}

function filter_future(predicate_fun) {
  return val => {
    const result = predicate_fun(val);

    if (result.then) {
      const return_result = predicate_res =>
        predicate_res ? val : Promise.reject();

      return result.then(return_result);
    }

    return result ? val : Promise.reject();
  };
}

module.exports = {
  Future,
  Maybe
};

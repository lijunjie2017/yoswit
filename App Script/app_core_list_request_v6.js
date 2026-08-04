/**
 * @param {string | Function} requestUrl
 * @param {Object} options
 */
erp.script.app_core_list_request = (requestUrl, options) => {
  // utils function
  function is(val, type) {
    return Object.prototype.toString.call(val) === `[object ${type}]`;
  }
  function isObject(val) {
    return val !== null && is(val, 'Object');
  }
  function isFunction(val) {
    return typeof val === 'function';
  }
  function isPromise(val) {
    return is(val, 'Promise') || (isObject(val) && isFunction(val.then) && isFunction(val.catch));
  }
  function getResponseDataByKey(data, path) {
    if (window.lodash) {
      return lodash.get(data, path);
    } else {
      return data[path];
    }
  }

  // opt
  const pagination = { page: 0, hasMoreItems: true, allowInfinite: true, items: [] };
  const { limit = 20, responseKey = 'data', transformResponse, $update, onError, onLoaded, canLoadmore } = options || {};

  // prevent repeat loadmore
  let lock = false;

  async function request(url) {
    console.log('[app_core_list_request] -- request start');

    let localItems = [];

    if (typeof url === 'string') {
      const requestUrl = url
        .replace('${page}', pagination.page * limit)
        .replace('${limit}', limit)
        .replace(encodeURIComponent('${page}'), pagination.page * limit)
        .replace(encodeURIComponent('${limit}'), limit);

      let params = options.params || null;
      if (isObject(params)) {
        params = Object.assign({}, options.params);

        Object.keys(params).forEach((key) => {
          const v = params[key];
          if (typeof v === 'string') {
            params[key] = v.replace('${page}', pagination.page * limit).replace('${limit}', limit);
          }
        });
      } else if (isFunction(params)) {
        const ret = params(pagination.page, limit);
        if (ret) {
          params = ret;
        }
      }

      const response = await http2.request(requestUrl, {
        ...options,
        debug: options.debug || window.http2._defaultOptions.debug,
        params: params,
        // wrap cacheKey
        cacheKey: options.cacheKey
          ? () => {
              return `${options.cacheKey}@${pagination.page}`;
            }
          : undefined,
        transformResponseHook: options.transformResponseHook ? (resp) => options.transformResponseHook(resp, pagination) : undefined,
      });
      localItems = getResponseDataByKey(response.data, responseKey);
    } else if (isFunction(url)) {
      const returnVal = url(pagination.page, limit);

      if (isPromise(returnVal)) {
        localItems = await returnVal;
      } else {
        localItems = returnVal;
      }
    }

    // original size
    const size = localItems.length;

    if (transformResponse && isFunction(transformResponse)) {
      const transformItems = transformResponse(localItems, { page: pagination.page, limit: limit });

      if (isPromise(transformItems)) {
        localItems = await transformItems;
      } else {
        localItems = transformItems;
      }
    }

    return { items: localItems || [], size: size };
  }

  async function loadMore() {
    if (!pagination.hasMoreItems) return;
    if (lock) return;

    lock = true;
    pagination.allowInfinite = true;
    $update();

    try {
      const { items: localItems, size } = await request(requestUrl);

      if (isFunction(canLoadmore)) {
        pagination.hasMoreItems = !!canLoadmore(localItems, pagination);
      } else if (size <= 0 || size < limit) {
        pagination.hasMoreItems = false;
      } else {
        pagination.hasMoreItems = true;
      }

      if (pagination.hasMoreItems) {
        pagination.page++;
      }

      pagination.items.push(...localItems);

      lock = false;
      pagination.allowInfinite = false;

      if ($update) {
        $update();
      }

      if (onLoaded && isFunction(onLoaded)) {
        onLoaded(pagination.items, pagination);
      }
    } catch (err) {
      lock = false;
      pagination.allowInfinite = false;
      if ($update) {
        $update();
      }

      if (onError && isFunction(onError)) {
        onError(pagination.page, err);
      }

      console.error('load more error: ' + err);
      console.error(err);
    }
  }

  async function refresh(e, done) {
    if (lock) return;

    // reset
    pagination.hasMoreItems = true;
    pagination.page = 0;
    pagination.items = [];

    try {
      await loadMore();
    } catch (err) {
      console.error(err);
    }

    if ($update) {
      $update();
    }

    if (done) {
      done();
    }
  }

  return {
    pagination,
    loadMore,
    refresh,
    request,
  };
};

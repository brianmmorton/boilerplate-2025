import { schema, normalize, denormalize } from "normalizr";
import { User as UserType } from "types/User";
import { Thing as ThingType } from "types/Thing";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { differenceInMinutes } from "date-fns";

const defaultMergeStrategy = (entityA: object, entityB: object) => {
  return {
    ...entityA,
    ...entityB,
  };
};

export const User = new schema.Entity<UserType>(
  "users",
  {},
  {
    mergeStrategy: defaultMergeStrategy,
  }
);

export const Thing = new schema.Entity<ThingType>(
  "things",
  {
    members: [User],
  },
  {
    mergeStrategy: defaultMergeStrategy,
  }
);

type EntityType<S> = S extends schema.Entity<infer T> ? T : never;

const ModelNameToSchema = {
  user: User,
  thing: Thing,
} as const;

type ModelName = keyof typeof ModelNameToSchema;

type BoilerplateCache = {
  users: {
    [k: string]: EntityType<typeof User> | undefined;
  };
  things: {
    [k: string]: EntityType<typeof Thing> | undefined;
  };
};

const _cache = create<
  BoilerplateCache & { _update: (nextState: BoilerplateCache) => void }
>((setState) => ({
  users: {},
  things: {},
  _update: (nextState: BoilerplateCache) => {
    setState(nextState);
  },
}));

const _httpCache = create<{
  requests: Record<string, Record<string, Promise<Response>>>;
  lastTokenRefresh: Date | null;
  setRequestCache: (
    nextState: Record<string, Record<string, Promise<Response>>>
  ) => void;
  setLastTokenRefresh: (token: Date | null) => void;
}>((setState) => ({
  requests: {},
  lastTokenRefresh: null,
  setRequestCache: (
    requests: Record<string, Record<string, Promise<Response>>>
  ) => setState({ requests }),
  setLastTokenRefresh: (lastTokenRefresh: Date | null) =>
    setState({ lastTokenRefresh }),
}));

class Cache {
  cache = _cache;
  httpCache = _httpCache;

  set<Model extends ModelName>(
    model: Model,
    data: BoilerplateCache[`${Model}s`][string] | null
  ) {
    const normalized = normalize(data, ModelNameToSchema[model]);

    const entities = normalized["entities"];

    const { _update, ...nextCache } = this.cache.getState();

    (Object.keys(entities) as `${ModelName}s`[]).forEach((entity) => {
      const allIds = [
        ...Object.keys(nextCache[entity]),
        ...Object.keys(entities[entity] ?? {}),
      ];

      allIds.forEach((idKey) => {
        if (idKey in nextCache[entity]) {
          nextCache[entity][idKey] = {
            ...nextCache[entity][idKey],
            ...entities[entity]![idKey],
          };
        } else {
          nextCache[entity][idKey] = entities[entity]![idKey];
        }
      });
    });

    _update(nextCache);
  }

  remove<Model extends ModelName>(model: Model, id: string) {
    const { _update, ...nextCache } = this.cache.getState();

    if (!nextCache[`${model}s`][id]) {
      return;
    }

    delete nextCache[`${model}s`][id];

    _update(nextCache);
  }

  get<Model extends ModelName>(model: Model, id: string) {
    const cache = this.cache.getState();
    return denormalize(cache[`${model}s`][id], ModelNameToSchema[model], cache);
  }

  async fetchData<Model extends ModelName>(
    model: Model,
    {
      url,
      merge,
      signal,
      didRetry,
    }: {
      url: string;
      merge?: (data: any) => any;
      signal?: RequestInit["signal"];
      didRetry?: boolean;
    }
  ): Promise<Response> {
    const { requests, lastTokenRefresh, setRequestCache, setLastTokenRefresh } =
      this.httpCache.getState();

    if (!requests[model]) {
      requests[model] = {};
    }

    // @ts-expect-error
    if (requests[model][url]) {
      return (await requests[model][url]).clone();
    }

    if (
      !lastTokenRefresh ||
      differenceInMinutes(lastTokenRefresh, new Date()) > 15
    ) {
      setLastTokenRefresh(new Date());
      await fetch(`/1/auth/refresh-tokens`, {
        method: "POST",
        credentials: "include",
      });
    }

    requests[model][url] = fetch(url, {
      method: "GET",
      signal,
    });

    setRequestCache(requests);

    const response = await (await requests[model][url]).clone();

    if (response.status === 401 && !didRetry) {
      setLastTokenRefresh(new Date());
      await fetch(`/1/auth/refresh-tokens`, {
        method: "POST",
        credentials: "include",
      });

      delete requests[model][url];

      return this.fetchData(model, {
        url,
        merge,
        signal,
        didRetry: true,
      });
    }

    const data = await response.json();
    const formatted = merge ? merge(data) : data;

    if (response.ok && formatted) {
      this.set(model, formatted);
    }

    return (await requests[model][url]).clone();
  }

  async create<Model extends ModelName>(
    model: Model,
    id: number | string,
    {
      url,
      method = "POST",
      data,
      merge,
      signal,
      didRetry,
    }: {
      url: string;
      method?: RequestInit["method"];
      data: object | Array<any>;
      merge?: (
        data: any,
        current: BoilerplateCache[`${Model}s`][string]
      ) => any;
      signal?: Request["signal"];
      didRetry?: boolean;
    }
  ): Promise<
    [BoilerplateCache[`${Model}s`][string] | null, Error | null, Response]
  > {
    const { lastTokenRefresh, setLastTokenRefresh } = this.httpCache.getState();

    if (
      !lastTokenRefresh ||
      differenceInMinutes(lastTokenRefresh, new Date()) > 15
    ) {
      setLastTokenRefresh(new Date());
      await fetch(`/1/auth/refresh-tokens`, {
        method: "POST",
        credentials: "include",
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401 && !didRetry) {
      setLastTokenRefresh(new Date());
      await fetch(`/1/auth/refresh-tokens`, {
        method: "POST",
        credentials: "include",
      });

      return this.create(model, id, {
        url,
        merge,
        method,
        data,
        signal,
        didRetry: true,
      });
    }

    const json = await response.json();

    const state = this.cache.getState();
    const formatted = merge
      ? merge(
          json,
          denormalize(state[`${model}s`][id], ModelNameToSchema[model], state)
        )
      : json;

    if (response.ok && formatted) {
      this.set(model, formatted);

      const state = this.cache.getState();
      return [
        denormalize(
          state[`${model}s`][json.id],
          ModelNameToSchema[model],
          state
        ),
        null,
        response,
      ];
    }

    if (json.code && json.message) {
      return [null, new Error(json.message as string), response];
    }

    return [null, new Error("Unknown error occurred"), response];
  }
}

export const cache = new Cache();

export const useModel = <Model extends ModelName, Data>(
  model: Model,
  id: string | number | null | undefined,
  selector: (state: BoilerplateCache[`${Model}s`][string] | null) => Data
) => {
  return cache.cache(
    useShallow<BoilerplateCache, Data>((state) => {
      if (!id) {
        return selector(null);
      }
      return selector(
        denormalize(state[`${model}s`][id], ModelNameToSchema[model], state)
      );
    })
  );
};

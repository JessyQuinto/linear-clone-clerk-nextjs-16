/* eslint-disable */
/**
 * Mock api proxy object that acts as a generic proxy,
 * resolving any nested property to a string like "tableName.functionName".
 */
export const api = new Proxy(
  {},
  {
    get(target, prop) {
      const namespace = String(prop);
      return new Proxy(
        {},
        {
          get(innerTarget, innerProp) {
            const func = String(innerProp);
            return `${namespace}.${func}`;
          },
        }
      );
    },
  }
) as any;

const clean = <T>(config: T): T =>
  Object.keys(config).reduce((map, key) => {
    const propType = typeof config[key];
    if (propType === 'object' && config[key] !== null && !Array.isArray(config[key]))
      map[key] = clean(config[key]);
    else if (propType !== 'undefined') map[key] = config[key];

    return map;
  }, {} as T);

export { clean };

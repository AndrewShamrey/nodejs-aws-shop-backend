const toLowerKeys = <T>(obj: T): T => {
  const entries = Object.entries(obj);
  return Object.fromEntries(entries.map(([key, value]) => [key.toLowerCase(), value])) as T;
};

const getValueFromHeaders = (headers: unknown = {}): ((key: string) => string) => {
  const headersByLowerKeys = toLowerKeys(headers);
  return (key: string): string => headersByLowerKeys[key.toLowerCase()];
};

export { getValueFromHeaders, toLowerKeys };

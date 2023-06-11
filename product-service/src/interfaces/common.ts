/** @example 2023-05-16T14:06:19.172Z @pattern ^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)$ */
type DateISO = string; // ISO time: yyyy-mm-ddThh:mm:ss.nnnZ

/** @example Very long text */
type Text = string;

/** @example 48b21827-7476-44ab-ba71-0c49401f8495 */
type UUID = string;

export { DateISO, Text, UUID };

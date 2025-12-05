const warn = (...args: any[]) => {
  if (typeof process === 'undefined') {
    return;
  }

  const shouldLog: boolean = process?.env?.JEST_WORKER_ID === undefined;
  if (shouldLog) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

export default {
  warn,
};

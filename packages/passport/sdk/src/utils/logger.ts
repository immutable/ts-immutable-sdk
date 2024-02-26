const shouldLog: boolean = process?.env?.JEST_WORKER_ID === undefined;

const warn = (...args: any[]) => {
  if (shouldLog) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

export default {
  warn,
};

// These functions are to handle clock skew between the browser and the server.
let clockSkew = 0;

export const setClockSkew = (serverUnixTime: string) => {
  // Get the server time in milliseconds
  const sTime = parseInt(serverUnixTime, 10) * 1000;
  const serverTime = new Date(sTime);
  const now = new Date();
  clockSkew = serverTime.getTime() - now.getTime();
  return clockSkew;
};

export const getCorrectedTime = () => {
  const now = new Date().getTime() + clockSkew;
  const fixedDate = new Date(now).toISOString();
  return fixedDate;
};

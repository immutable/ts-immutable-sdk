/**
 * Factory function to create a performance snapshot of an async function.
 * @param fn
 * @param mark
 */
let performanceSpanId = 0;
export const performanceAsyncSnapshot = <T>(fn: (...args: any[]) => Promise<T>, mark: string) => (
  async (...args: any[]): Promise<T> => {
    performanceSpanId++;
    const markStart = `${mark}-start-${performanceSpanId}`;
    const markEnd = `${mark}-end-${performanceSpanId}`;

    performance.mark(markStart);
    let result: T;
    try {
      result = await fn(...args);
    } catch (error: any) {
      performance.mark(markEnd);
      performance.measure(mark, markStart, markEnd);
      throw error;
    }
    performance.mark(markEnd);
    performance.measure(mark, markStart, markEnd);

    return result;
  }
);

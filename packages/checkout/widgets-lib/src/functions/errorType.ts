export function isRejectedError(err: unknown): boolean {
  const reason = `${
    (err as any)?.reason || (err as any)?.message || ''
  }`.toLowerCase();
  return reason.includes('rejected') && reason.includes('user');
}

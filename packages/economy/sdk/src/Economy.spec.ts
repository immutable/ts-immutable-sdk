import { Economy } from './Economy';

describe('Economy Class', () => {
  it('should build a class instance', () => {
    const economy = Economy.build();
    expect(economy).toBeInstanceOf(Economy);
  });
});

import TypedEventEmitter from './typedEventEmitter';

type TestEvents = {
  testEvent1: [Array<number>];
  testEvent2: [{ id: number }],
};

describe('TypedEventEmitter', () => {
  it('should be able to emit and listen to events', () => {
    const eventEmitter = new TypedEventEmitter<TestEvents>();

    const testEvent1Handler = jest.fn();
    const testEvent2Handler = jest.fn();

    eventEmitter.on('testEvent1', testEvent1Handler);
    eventEmitter.on('testEvent2', testEvent2Handler);

    eventEmitter.emit('testEvent1', [1, 2, 3]);
    eventEmitter.emit('testEvent2', { id: 1 });

    expect(testEvent1Handler).toHaveBeenCalledWith([1, 2, 3]);
    expect(testEvent2Handler).toHaveBeenCalledWith({ id: 1 });

    eventEmitter.removeListener('testEvent1', testEvent1Handler);
    eventEmitter.removeListener('testEvent2', testEvent2Handler);

    eventEmitter.emit('testEvent1', [4, 5, 6]);
    eventEmitter.emit('testEvent2', { id: 2 });

    expect(testEvent1Handler).toHaveBeenCalledTimes(1);
    expect(testEvent2Handler).toHaveBeenCalledTimes(1);
  });
});

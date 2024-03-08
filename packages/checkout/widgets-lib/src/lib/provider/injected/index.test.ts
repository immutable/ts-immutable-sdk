import * as Exports from './index';

it('should expose correct exports', () => {
  expect(Object.keys(Exports)).toMatchInlineSnapshot(`
    [
      "createStore",
      "announceProvider",
      "requestProviders",
    ]
  `);
});

import JSDOMEnvironment from 'jest-environment-jsdom';

export default class CustomEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();

    // In browser environments, the global Buffer is not available.
    (this.global.Buffer as any) = undefined;
  }
}

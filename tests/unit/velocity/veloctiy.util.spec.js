import utils from '../../../src/velocity.util.js';

describe('test velocity util', function() {
  it('test guid function', function() {
    expect(utils.guid()).toBe(0);
    expect(utils.guid()).toBe(1);
    expect(utils.guid()).toBe(2);
  });
});

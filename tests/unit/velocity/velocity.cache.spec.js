import {get, set, clear, getKey} from '../../../src/velocity.cache';

describe('test velocity cache', function () {

  it('test set and get', function () {
    var tpl = '#if($data)<div>1</div>#end';
    expect(get(tpl)).toBe(null);
    set(tpl, '<div>1</div>');
    expect(get(tpl)).toBe('<div>1</div>');
  });
  it('test clear', function () {
    var tpl = '#if($data)<div>1</div>#end';
    set(tpl, '<div>1</div>');
    expect(get(tpl)).toBeDefined();
    clear();
    expect(get(tpl)).toBe(null);
  });
  it('test getKey', function () {
    var tpl = '# if( $data ) <div>1</div>\n #end';
    expect(getKey(tpl)).toBe('#if($data)<div>1</div>#end');
  });
});

import {compile, compileHtml, filterExp, config, pop} from '../../../src/velocity.complie';

describe('test compile', function() {


  it('test compileHtml', function() {
    expect(compileHtml('<div>')).toBe('\'<div>\'');
    expect(compileHtml('<div>${item}')).toBe('\'<div>\'+(item)');
    expect(compileHtml('<div>${item}')).toBe('\'<div>\'+(item)');
    expect(compileHtml('<div>${item}</div>')).toBe('\'<div>\'+(item)+\'</div>\'');
    expect(compileHtml('<div>${item}$item</div>')).toBe('\'<div>\'+(item)+\'$item</div>\'');
    expect(compileHtml('<div>${ite}</div>')).toBe('\'<div>\'+(ite)+\'</div>\'');
    expect(compileHtml('<div>  ${item}  </div>')).toBe('\'<div>  \'+(item)+\'  </div>\'');
    expect(compileHtml('<div>${item[0]}</div>')).toBe('\'<div>\'+(item[0])+\'</div>\'');
    expect(compileHtml('<div>${item[0]}1231</div>')).toBe('\'<div>\'+(item[0])+\'1231</div>\'');
    expect(compileHtml('<div>${item}1231</div>')).toBe('\'<div>\'+(item)+\'1231</div>\'');
    expect(compileHtml('<div>${max(\'1\')}</div>')).toBe('\'<div>\'+(max(\'1\'))+\'</div>\'');
    expect(compileHtml('<div>${max(${item})}</div>')).toBe('\'<div>\'+(max((item)))+\'</div>\'');
    expect(compileHtml('<div>${max([1,3,4,5])}</div>')).toBe('\'<div>\'+(max([1,3,4,5]))+\'</div>\'');
    expect(compileHtml('<div>${max(1 > ${item})}</div>')).toBe('\'<div>\'+(max(1 > (item)))+\'</div>\'');
    expect(compileHtml('<div>${obj.str()}</div>')).toBe('\'<div>\'+(obj.str())+\'</div>\'');
    expect(compileHtml('<div>$!{q}</div>')).toBe('\'<div>\'+(function() {try {return((q)?(q):\'\')} catch(e) {return \'\';}})()+\'</div>\'');
    expect(compileHtml('<div>$!{max([1,3,4,5])}</div>')).toBe('\'<div>\'+(function() {try {return((max([1,3,4,5]))?(max([1,3,4,5])):\'\')} catch(e) {return \'\';}})()+\'</div>\'');
  });

  it('test pop', function() {
    expect(pop(['$', '{', '$', '{', 'i', 't', 'e', 'm', '}'], 1)).toBe('((item))');
    expect(pop(['$', '!', '{', 'i', 't', 'e', 'm'], 0)).toBe('(function() {try {return((item)?(item):\'\')} catch(e) {return \'\';}})()');
  });

  it('test filterExp', function() {
    expect(filterExp('${item} = 1')).toBe('item = 1');
    expect(filterExp('$item = 1')).toBe('item = 1');
    expect(filterExp('$item = $date')).toBe('item = date');
    expect(filterExp('${item} = ${date}')).toBe('item = date');
    expect(filterExp('${item = date}')).toBe('item = date');
    expect(filterExp('$item = {a: date}')).toBe('item = {a: date}');
    expect(filterExp('${item} = {a: date}')).toBe('item = {a: date}');
  });

  it('test compile', function() {
    expect(compile('<div>')).toBe('__.push(\'<div>\');');
    expect(compile('<div>${item}</div>')).toBe('__.push(\'<div>\'+(item)+\'</div>\');');
    expect(compile(['<div>#if(item>1)<div>${item}</div>', '<div>', 'if', 'item > 1',
      '<div>${item}</div>', 0, '<div>#if(item>1)<div>${item}</div>#end']))
      .toBe('__.push(\'<div>\');if(item > 1) {__.push(\'<div>\'+(item)+\'</div>\');');
  });

  it('test compile foreach', function() {
    expect(config.foreach('$item in $data').replace(/(\r|\n|\r\n|\s+)/g, ''))
      .toBe('varvelocityCount=0;varvelocityIndex=-1;for(var_v0indata){velocityCount++;velocityIndex++;varitem=data[_v0];');
    expect(config.foreach('$item in ${data}').replace(/(\r|\n|\r\n|\s+)/g, ''))
      .toBe('varvelocityCount=0;varvelocityIndex=-1;for(var_v1indata){velocityCount++;velocityIndex++;varitem=data[_v1];');
  });

  it('test compile set', function() {
    expect(config.set('${item} = 1')).toBe('var item = 1;');
    expect(config.set('$item = 1')).toBe('var item = 1;');
    expect(config.set('$item.a = 1')).toBe('item.a = 1;');
  });

  it('test compile elseif', function() {
    expect(config.elseif('item == 1')).toBe('} else if (item == 1) {');
    expect(config.elseif('$item == 1')).toBe('} else if (item == 1) {');
    expect(config.elseif('$item.a == 1')).toBe('} else if (item.a == 1) {');
    expect(config.elseif('$item.a \&lt 1')).toBe('} else if (item.a < 1) {');
  });

  it('test compile else', function() {
    expect(config.else()).toBe('} else {');
  });

  it('test compile if', function() {
    expect(config.if('$item.a == 1')).toBe('if(item.a == 1) {');
    expect(config.if('$item.a \&lt 1')).toBe('if(item.a < 1) {');
  });

  it('test compile break', function() {
    expect(config.break()).toBe('break;');
  });

  it('test compile end', function() {
    expect(config.end()).toBe('}');
  });
});

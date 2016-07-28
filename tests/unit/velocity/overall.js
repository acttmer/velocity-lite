import Velocity from '../../../src/main';
console.log(Velocity);

describe('test if', function(){
  it('单条if true语句', function() {
    var tpl = '#if($item)<div>1</div>#end',
      data = { item: true },
      result = '<div>1</div>';
    
    console.log(Velocity);
    var v = new Velocity(tpl);
    console.log(v);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('单条if false语句', function() {
    var tpl = '#if($item)<div>1</div>#end',
      data = { item: false },
      result = '';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('if 表达式1 语句', function() {
    var tpl = '#if($item == 1)<div>1</div>#end',
      data = { item: 1 },
      result = '<div>1</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  
  it('if 表达式 == 语句', function() {
    var tpl = '#if($item.length == 2)<div>${item[0]}</div>#end',
      data = { item: [1,2]},
      result = '<div>1</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  
  it('if 表达式 > 语句', function() {
    var tpl = '#if($item.length > 1)<div>${item[0]}</div>#end',
      data = { item: [1,2]},
      result = '<div>1</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });


  it('if 表达式 < 语句', function() {
    var tpl = '#if($item.length < 3)<div>${item[0]}</div>#end',
      data = { item: [1,2]},
      result = '<div>1</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('if (true) else 语句', function() {
    var tpl = '#if($bool)<div>0</div>#else<div>1</div>#end',
      data = { bool: true},
      result = '<div>0</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('if (false) else 语句', function() {
    var tpl = '#if($bool)<div>0</div>#else<div>1</div>#end',
      data = { bool: false},
      result = '<div>1</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('if语句语句里面嵌套if', function() {
    var tpl = '#if($bool_outer)#if($bool_inner)1#end#end',
      data = { bool_outer: true,bool_inner : true},
      result = '1';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('模板里面嵌套if语句', function() {
    var tpl = '<div class="class1 #if($bool)class2#end">1</div>',
      data = { bool: true},
      result = '<div class="class1 class2">1</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  }); 

  it('is elseif语句', function(){
    var tpl = '#if($num == 1)<div>1</div>#elseif($num == 2)<div>2</div>#else<div>3</div>#end',
      data = {num : 2},
      result = '<div>2</div>';
    var html = new Velocity(tpl).render(data);
    expect(html).toBe(result);  
  }); 
});

describe('test set', function(){
  
  it('单个赋值', function(){
    var setTpl = '#set($item = $s)<div>${item}</div>';
    var data = {
      s: 100
    };
    var v = new Velocity(setTpl);
    var r = v.render(data);
    expect(r).toBe('<div>100</div>');
  });

  it('对象赋值', function(){
    var setTpl = '#set($item = {})#set($item.t = 100)<div>${item.t}</div>';
    var v = new Velocity(setTpl);
    var r = v.render({});
    expect(r).toBe('<div>100</div>');
  });

  it('数组赋值', function(){
    var setTpl = '#set($item = ["a","b"])<div>${item[0]}</div>';
    var v = new Velocity(setTpl);
    var r = v.render({});
    expect(r).toBe('<div>a</div>');
  }); 
});

describe('test foreach', function(){
  it('foreach 语句', function() {
    var tpl = '<div>#foreach($item in $data)<p>$!{item.name}</p>#end</div>',
      data = { data : [{
        name: 'case1'
      },{
        name: 'case2'
      }] },
      result = '<div><p>case1</p><p>case2</p></div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('属性循环', function() {
    var tpl = '<div class="#foreach($item in $classA)$!{item} #end"></div>',
      data = { classA : ['c1','c2'] },
      result = '<div class="c1 c2 "></div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('foreach + if + break', function() {
    var tpl = '#foreach($item in $classA)<div>$item</div>#if($item == "c1")#break#end#end',
      data = { classA : ['c1','c2'] },
      result = '<div>c1</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('foreach index',function(){
    var tpl = '#foreach($item in $classA)<div>$item $foreach.index $foreach.count</div>#end',
      data = {classA : ['a','b']},
      result = '<div>a 0 1</div><div>b 1 2</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);

  })

  it('双重foreach', function(){
    var tpl ='#foreach($item in $items)<ul>#foreach($i in $item.a)<li>$i</li>#end</ul>#end',
      data = {items : [{a : [1,2,3]},{a:[4,5,6]}]},
      result = '<ul><li>1</li><li>2</li><li>3</li></ul><ul><li>4</li><li>5</li><li>6</li></ul>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });
});

describe('test function', function(){
  it('size 方法',function(){
    var tpl = '<div>$item.size()</div>',
      data = {item : [1,2,3]},
      result = '<div>3</div>';
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });

  it('注册方法', function(){
    var tpl = '<div>#if(!$StringUtil.isEmpty($item))111#else 222 #end</div>',
      data = {item : "1"},
      result = '<div>111</div>';
    Velocity.register('StringUtil',{
      'isEmpty' : function(str){
        return str == "" || str.length == 0;
      }
    });
    var v = new Velocity(tpl);
    var html = v.render(data);
    expect(html).toBe(result);
  });
});

describe('test specialSymbols', function(){
  it('\'----------- ', function() {
    var tpl = '<div>${item[\'name\']}</div>';
    var v = new Velocity(tpl);
    var r = v.render({
      item: {
        name: 'messi'
      }
    });
    expect(r).toBe('<div>messi</div>');
  });


  it('$1-----------', function() {
    var setTpl = '#set($item = ["a","b"])' + '<div>${item[0]}\\$1</div>';
    var v = new Velocity(setTpl);
    var r = v.render({});
    expect(r).toBe('<div>a$1</div>');
  });

  it('字符串中出现 < 和 空格', function() {
    var tpl = '#set(${a} = \'1 < 10\')<div>${a}</div>';
    var v = new Velocity(tpl);
    var r = v.render({
      var1: 'test1',
      var2: 'test2'
    });
    expect(r).toBe('<div>1 < 10</div>');
  });
  it('##-----------', function() {
    var setTpl = '#set($item = ["a","b"])<div>\\#\\#</div>';
    var v = new Velocity(setTpl);
    var r = v.render({});
    expect(r).toBe('<div>##</div>');
  });
  it('#if-----------', function() {
    var setTpl = '<div>"\\#if"</div>';
    var v = new Velocity(setTpl);
    var r = v.render({});
    expect(r).toBe('<div>"#if"</div>');
  });
});

import {reg, step1, step2, step3, step4, step5, step6, step7} from '../../../src/velocity.parse.js';

describe('test velocity parse', function() {
  it('test reg step 1', function(){
    expect(step1(' [[  ')).toBe('');
  });

  it('test reg step 2', function(){
    expect(step2(' ]]  ')).toBe('');
  });

  it('test reg step 3', function(){
    expect(step3('#   {Hello}')).toBe('#Hello ');
  });

  it('test reg step 4', function(){
    expect(step4('Next is comment: ## This will not be display\n')).toBe('Next is comment: \n');
  });

  it('test reg step 5', function(){
    expect(step5('#if    ($a == (1 + 1.5) * 2)\n')).toBe('#if($a ==(1 + 1.5) * 2)');
  });

  it('test reg step 6', function(){
    expect(step6('#if($a == "1 < 10") < div> < /div> #end')).toBe('#if($a == "1<10")<div></div> #end');
  });

  it('test reg step 7', function(){
    expect(step7('#if ($a <= 1)')).toBe('#if ($a &lt= 1)');
  });

  it('test reg', function(){
    reg('#if ($a == "Hello World")', 'if|elseif|else|end|foreach|break|set')(function(input){
      if (!(typeof input=='string')){
        expect(input[2]).toBe('if');
        expect(input[4]).toBe(' ($a == "Hello World")');
      }
      return '';
    });
  });
});

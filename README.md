# Velocity Lite 使用手册

### 0.1.2 正式版

---

## Velocity Lite 的目标

* 基于 js 实现，轻量且完全兼容后端 Java 版 Velocity

* 具有丰富功能和强大报错系统

---

## 教程

### 快速开始

```
    <script src="path/to/velocity-lite-{version}.js"></script>
    
    <div id="display_tpl"></div>
    
    <script id="tpl" type="text/template">
        <div>Username: $username, Age: $age</div>
    </script>
    
    <script>
        var templateText = document.getElementById('tpl').innerHTML;
        var v = new Velocity(templateText);
        
        var result = v.render({
            username: 'abcde',
            age: 28
        });
        
        document.getElementById('display_tpl').innerHTML = result;
    </script>
```

### 在模板中引用变量

* 普通引用

```
    <script>My name is $name</script>
```

* 加括号引用

```
    <script>My name is ${name}</script>
```

* 安静引用
    * 在此模式下，如果变量不存在则显示空字符串
    * ! 标识必须紧挨着 $

```
    <script>My name is $!name</script>
    <script>My name is $!{name}</script>
```

* 方法调用

    * 方法调用暂不支持多级回调函数

```
    支持下列情况
    <script>My name is $me.getName()</script>
    <script>My name is ${me.getName()}</script>

    不支持下列情况
    <script>My name is $getPerson('me')()</script>
    <script>My name is ${$getPerson('me')()}</script>
```

* 作为字符输出

    * 当 $ 或 $! 后面是空格或者其它除._等特殊符号之外的情况，则直接原样输出

```
    <script>$ is dollar</script>
    <script>$! has no meaning</script>
```


### 转义、字符串与注释

* 转义单个字符

```
    <script>I am a \#developer</script>
    <script>I love \$dollar</script>
```
    
> **输出结果**
> 
> I am a #developer
> I love $dollar

* 不解析某一区块

```
    <script>
        #[[
            My name is $Yeah! #if #else #set
        ]]#
    </script>
```

> **输出结果**
> 
> My name is $Yeah! #if #else #set


* 字符串

    * 在字符串内，仅需要对 $ 和 引号做转义处理

```
    <script>My name is $me.getMynameByUsername("Ilove\$\"")</script>
```

> **输出结果**
> 
> 'My name is' + me.getMynameByUsername('Ilove$"')

* 单行注释

```
    <script>
        ## Comment
    </script>
```

* 多行注释

```
    <script>
        #*
            Multiple lines Comment
            1
            2
            3
        *#
    </script>
```

### 支持的指令

* 定义变量

```
    #set($variable = "String")
    #set($copy = $variable)
```

* 逻辑

```
    #if ($variable == "String")
        <div>\$Variable == "String" is true</div>
    #elseif ($variable == 2016)
        <span>$variable is a good year</span>
    #end
    
    <div class="widget #if($using) enabled #else disabled #end">Something</div>
```

* 循环遍历

    * Velocity Lite 只支持一种循环遍历

    * $foreach.index 表示元素在数组中的index (从 0 开始)

    * $foreach.count 表示元素在数组中的第几个 (从 1 开始)

    * $foreach.hasNext 返回布尔值表示是否有下一个元素

```
    #set ($items = [
        {id: 1, number: 10},
        {id: 2, number: 15},
        {id: 3, number: 5},
        {id: 4, number: 0}
    ])
    
    <ul>
        #foreach ($item in $items)
            #if (
                $foreach.index == 3 &&
                $foreach.count == 4
            ) 
                #break
            #end
            <li> Id: $item.id, Number: $item.number, *hasNext: $foreach.hasNext</li>
        #end
    </ul>
```

> 如上代码将分别输出前三个物品，而最后一个因为中间break所以未能显示


### 扩展

* 注册插件 (用户自定义方法)

```
    // 以下代码用于注册转义HTML的插件方法
    Velocity.register({
        esc: {
            html: function(str) {
                return str.replace(/[<>&"]/g, function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
            }
        }
    });
    
    // 调用演示 (In Template)
    $esc.html($username)
```

* 配置

```
    Velocity.config({
        undefinedOutput: false, // 变量不存在时是否输出 $ + 原字符
        sessionCache: false, // 是否使用 sessionStorage 作为缓存技术
        
        exactErrorLine: false 
        // 在引入了 Jquery 或 Zepto 的前提下，是否开启准确错误行定位 (可定位在HTML文件里的位置)
    });
```

### 性能数据

![](http://gitlab.qiyi.domain/html5/velocity-lite/raw/refined/img/performance.png)

Velocity Lite 性能优于绝大多数模板引擎，在 1000条数据 * 1000次渲染 测试中虽稍逊色于Juicer (个别时候互有胜负)，但领先于 artTemplate，完全满足各种场合的应用。

经测试，sessionStorage 作为缓存技术时并不会导致速度大幅下降，偏差仅仅在10ms左右，建议日常开启sessionCache避免重复编译。


### 代码原理简介

Velocity Lite 使用一个自制的语法树结构来完成整个解析编译步骤。  

<br>

在 parse 过程中，整个模板会被分成 符号 (symbols) 和 字词 (words) 这两个数组，整个解析步骤通过遍历 symbols 来控制状态，并将 words 里面的对应值写入树中。

(整个分词步骤通过正则表达式完成，可以极大提升解析性能)  

<br>

每一项特性被单独封装成一个解析器，目前有 变量解析器、指令解析器、字符串解析器、纯HTML解析器和单行、多行注释解析器。通过它们之间的递归调用，可以实现多级语法树的构建。

<br>

当 parse 结束之后，会返回一个生成好的类语法树 (parseStack)，例子如下：

```
    #set ($arr = [1,2,3,4,5,6])
    #if ($arr[2] == 3)
        <div>\$arr[2] == $arr[2]</div>
    #end
```

```
    [{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":" "},{"type":TYPE_DIRECTIVE,"val":"set","sublayer":[{"type":TYPE_SYNTAX,"val":""},{"type":TYPE_VARIABLE,"sublayer":[{"type":TYPE_SYNTAX,"val":"arr"}],"begin":12},{"type":TYPE_SYNTAX,"val":" "},{"type":TYPE_SYNTAX,"val":"="},{"type":TYPE_SYNTAX,"val":" "},{"type":TYPE_SYNTAX,"val":"[1"},{"type":TYPE_SYNTAX,"val":",2"},{"type":TYPE_SYNTAX,"val":",3"},{"type":TYPE_SYNTAX,"val":",4"},{"type":TYPE_SYNTAX,"val":",5"},{"type":TYPE_SYNTAX,"val":",6"},{"type":TYPE_SYNTAX,"val":"]"}],"begin":9},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":" "},{"type":TYPE_DIRECTIVE,"val":"if","sublayer":[{"type":TYPE_SYNTAX,"val":""},{"type":TYPE_VARIABLE,"sublayer":[{"type":TYPE_SYNTAX,"val":"arr"},{"type":TYPE_SYNTAX,"val":"[2"},{"type":TYPE_SYNTAX,"val":"]"}],"begin":36},{"type":TYPE_SYNTAX,"val":" "},{"type":TYPE_SYNTAX,"val":"="},{"type":TYPE_SYNTAX,"val":"="},{"type":TYPE_SYNTAX,"val":" 3"}],"begin":33},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":" "},{"type":TYPE_HTML,"val":"<div"},{"type":TYPE_HTML,"val":">"},{"type":TYPE_HTML,"val":"$arr"},{"type":TYPE_HTML,"val":"[2"},{"type":TYPE_HTML,"val":"]"},{"type":TYPE_HTML,"val":" "},{"type":TYPE_HTML,"val":"="},{"type":TYPE_HTML,"val":"="},{"type":TYPE_HTML,"val":" "},{"type":TYPE_VARIABLE,"sublayer":[{"type":TYPE_SYNTAX,"val":"arr"},{"type":TYPE_SYNTAX,"val":"[2"},{"type":TYPE_SYNTAX,"val":"]"}],"begin":67},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":"<"},{"type":TYPE_HTML,"val":"/div"},{"type":TYPE_HTML,"val":">"},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":" "},{"type":TYPE_DIRECTIVE,"val":"end","sublayer":false,"begin":82},{"type":TYPE_HTML,"val":""},{"type":TYPE_HTML,"val":" "}]
```

通过 compile 部分的最终递归编译，这个语法树会被转换为以下代码：

(本代码是 Velocity 配置 undefinedOutput = true 的生成结果)

```
    var $data = arguments[0]
      , $out = '';
    var arr = $data.arr || undefined;
    $out += '    ';
    arr = [1, 2, 3, 4, 5, 6];
    $out += '    ';
    if (arr[2] == 3) {
        $out += '        <div>$arr[2] == ';
        $out += (function() {
            try {
                return ( (arr[2] || arr[2] == 0) ? arr[2] : '$arr[2]')
            } catch (e) {
                return '$arr[2]';
            }
        })();
        $out += '</div>    ';
    }
    $out += '    ';
    return $out;
```

在编译过程中，连续的HTML内容会被合并编译，而空字符或者无意义的空格会被省略添加以提高执行性能。

<br>

在变量域实现上，参照 artTemplate 对变量进行了预编译，有效提升性能20%左右。

与此同时，在 compile 过程中使用了 (function(){})(); 对 foreach 包装来构造独立变量域。

<br>

现阶段，模板引擎支持结构语法错误和一些表达式典型错误的识别

<br>

下面是一些错误案例：

```
    #if（$a == 1） // 错误使用中文括号

    #ser ($a = 1) // 拼写错误

    #if ($b == "123123) // 字符串未结束

    #if ($a = 1) // 此处在js不会报错，但在模板引擎里，if应只使用逻辑判断

    #set ($a == 1) // set 只能定义变量，不应有逻辑表达式出现

    #if ($a == 1) #if ($b == 1) #end // 缺少对应 end

    #elseif ($a == 1) // 缺少 if 

    #foreach ($item as $items) // 错误将 in 写成 as
```

<br>

在通常情况下，模板引擎只支持报错到模板内行数，但如果用户引入了 Jquery 或者 Zepto 并且设置 exactErrorLine = true 的情况，

报错系统会尝试ajax获取本页源代码并通过计算得出错误行在 HTML 文件里的行数，便于开发人员快速定位错误点。

### 工具链

使用 npm, webpack 以及 karma 用于整套开发测试

<br>

下面是一些常用指令：

* npm run dev  --- 启动服务器

* npm run build  --- 生成压缩后的js

* npm run buildDev  --- 生成完整js

* npm run test  --- 单元测试
# Tank-Battle
一个用nodejs写的坦克大战，基于pixijs,websocket等框架

脑袋里最开始的想法是美好的，是想把它做成像slither.io diep.io那样有名的游戏，只可惜经验能力有限走了不少的弯路。
自学自研花了几个月，写了一个版本，这就是那个版本。我从中学到很多东西，同时也探觉了它很多的不足。下面写一点我的心得：

* 用nodejs来写游戏的服务器，最鸡肋的还是它的性能。像子弹轨迹，玩家的位置，等都是在服务器端运算的，同时nodejs又是单线程的。于是问题来了，如果把websocket通信，服务端裁判部分，服务端碰撞检测全都置于一个线程中，用户稍微一多，不得卡死？
于是我拆分了模块，在wsserver目录下，main.js是websocket服务的主服务，referee.js是裁判端，conn.js是负责用户通信。
我用nodejs中的children_process.fork来启动子进程，不过这中间最麻烦的是进程间的通信。因为nodejs的进程间是不能共享内存的。这里边的坑不说了，有兴趣可以看一看代码自己体会。

* 我在开发初期的时候，想做到前后端js代码公用，像游戏的逻辑部分还是完全可以前后端公用的。这个时候其实是可以考虑amd、cmd等规范的。但是为何我没有用它的原因是，我一开始就想着开发之后，压缩后的js更乱一点，别人看到我的代码更难懂一点。于是我就没有想过用通用的模块化的方式编程了。详见 `views`文件夹下的`index.html`中 `//copycode(wsserver/tools.js)`等代码，通过目录下的`copy.js` 将`index.html` 中的代码拷贝一份到 `wsserver`目录下。有兴趣的看一看代码自己体会一下，wsserver下`guns.js`,`jiangpin.js`,`tools.js`,`public.js`是代码自动从index.html中自动拷贝过来的。这样达到了我前后端代码重用的效果。

* 在index.html中看到这一行 `{% jsmin "-o /js/tank.js -b" %}`，这一行的作用其实是把这个标签包裹起来的内容进行内压缩，-o 表示导出到后面的`/js/tank.js`中,-b 是把代码括在一个闭包函数内运行, -u 表示禁用压缩。这样做的好处是，使我可以直接在index.html中写js，从而最大化利用visual studio的代码提示功能，使我更少出错。如果在单独的js文件中写代码，开发工具是不会进行代码提示的。

* socket的信息传输上，目前是通过字符串传输的，我把一个字符理解为2个字节，0-65535，一个坐标值x就可以直接用一个字符表示了，目前的这个也是压缩传输了，不过不是最好的，最好的方式是byte数组 Uint8Array的模式，我后面学了golang，详细的参了一下字符串，字节数组之间的转化，发现我写这个版本的时候踩了坑。我后面用golang来写游戏的服务端，发现性能提升很多，同时没这么麻烦了。golang支持多线程，同时线程间的内存变量是可以相互访问的。nodejs为了多线程，还必须得同步线程之间的数据，相当的麻烦。

再讲几点

* 游戏服务器性能方面，测试时大概容纳150个玩家流畅的同时游戏

* 碰撞检测用的最简单的办法，未使用四叉树和包围盒算法。动态规划处理消息的收发，减少服务器的负载，详情参见`wsserver/main.js` 的源码


## screenshot:

>demo 1:<br>
![demo1](https://raw.githubusercontent.com/yicheng-irun/Tank-Battle/master/res/demo.png)

## start:

先获取项目
```cmd
$ npm install
```
安装完node依赖
```cmd
$ node www
```
运行服务器


浏览器打开 
[http://localhost:5000/](http://localhost:5000/)


试玩之后，用浏览器打开 
[https://github.com/yicheng-irun/Tank-Battle](https://github.com/yicheng-irun/Tank-Battle)

点击此处，给我一颗星<br>

![thanks](https://raw.githubusercontent.com/yicheng-irun/Tank-Battle/master/res/thanks.png)
$(function () {
    // 0.监听内容的时时输入
	      // propertychange监听input框时时输入的事件
	     //delegate() 方法为指定的元素（属于被选元素的子元素）添加一个或多个事件处理程序，并规定当这些事件发生时运行的函数。
		 //prop 控制input框里的disabled得属性值
		 //当disabled为true时为不可点击，当为false时可以点击
		 //当前面有$("body").delegate这样的都是事件委托
	$("body").delegate(".comment","propertychange input", function () {
        // 判断是否输入了内容
        if($(this).val().length > 0){
            // 让按钮可用
            $(".send").prop("disabled", false);
        }else{
            // 让按钮不可用
            $(".send").prop("disabled", true);
        }
    });

    var number = window.location.hash.substring(1) || 1;
    getMsgPage();
    function getMsgPage(){//获取总页数
        $(".page").html("");//每次成功发布时，清空上一次保存在page的内容，这样页码不会重复
        // weibo.php?act=get_page_count	获取页数
        $.ajax({
            type:"get",
            url:"weibo.php",
            data:"act=get_page_count",
            success: function (msg) {
                // console.log(msg);
                var obj = eval("("+msg+")");
                for(var i = 0; i < obj.count; i++){
                    var $a = $("<a href=\"javascript:;\">"+(i+1)+"</a>");//每发布一条就创建一条
                    if(i ===0){//当i=0时，也就是第一页时
                        $a.addClass("cur");//给第一页的a标签添加一个cur类名
                    }
                    $(".page").append($a);//在把创建的a添加到page标签里
                }
            },
            error: function (xhr) {
                alert(xhr.status);
            }
        });
    }

    getMsgList(number)
    function getMsgList(number){//获取一页数据的函数，number为几就是获取第几页的数据
        $(".messageList").html("");//这行代码意思是：点击那页删除上面一页的数据，当前页面显示该页的数据
        //由于点击第二页那么第二页的数据会直接显示在第一页的下面，所以要使当前页面只显示第二页的数据那么只能清空上一页的数据，所以才要写上面一行代码
        $.ajax({
            type:"get",
            url:"weibo.php",
            data:"act=get&page="+number,
            success: function (msg) {
                var obj = eval("("+msg+")");//这里是获取的JSON数据数组
                $.each(obj, function (key, value) {//遍历JSON数组
                    // console.log(value);
                    // 根据内容创建节点
                    var $weibo = createEle(value);
                    //这个遍历出来的value是一个对象，里面有个id，这个id就相当于给消息做了一个标记 ，这样做就是让浏览器知道你点赞，踩和删除的是哪条消息
                    $weibo.get(0).obj = value;//给原生的dom元素绑定一个obj属性，并把这个value对象给这个dom元素属性
                    // 插入微博
                    $(".messageList").append($weibo);//后面发布的在上面，前面发布的在下面
                    // $(".messageList").prepend($weibo);这是让后面发布的在下面，前面发布的在上面
                });
            },
            error: function (xhr) {
                alert(xhr.status);
            }
        });
    }

    // 1.监听发布按钮的点击
    $(".send").click(function () {
        // 拿到用户输入的内容
        var $text = $(".comment").val();
        //在企业开发中一定要把自己打印的msg(接口)与weibo.php(后端给的接口)进行对比，如有不对应该询问后端人员这是什么意思
        //这是weibo.php(后端给的接口)：{id: ID, content: "内容", time: 时间戳, acc: 顶次数, ref: 踩次数}
        //这是打印的msg(接口)：{error: 0, id: 1, time: 1556722258, acc: 0, ref: 0}
        //如果点击发布没有报404，但是什么都没有打印那么你只需要把缓存或者浏览器历史记录全部删除即可
        $.ajax({//发布数据
            type:"get",
            url:"weibo.php",
            data:"act=add&content="+$text,
            success:function(msg){
                var obj = eval("("+msg+")");
                obj.content=$text//拿到文本内容，由于文本内容数据大则json数据里面没有用户输入的文本所以要自己拿
                // 根据内容创建节点
                var $weibo = createEle(obj);
                console.log(obj)
                //这个obj也是一个对象(其实就是msg)这样做就是让浏览器知道你点赞，踩和删除的是哪条消息
                $weibo.get(0).obj = obj;//给原生的dom元素绑定一个obj属性，并把对象给这个dom元素属性
                // 插入微博
                $(".messageList").prepend($weibo);
                // 重新获取一下页码
                getMsgPage();
                //当前页面消息数量大于6条是,删除最前面一条微博(也就是删除最下面的那条微博)
                if($(".info").length > 6){
                    $(".info:last-child").remove();
                }
            },
            error:function(xhr){
                alert(xhr.status);
            }
        })
        $(".comment").val("");//让文本框里的内容发布后为空
    });

    // 2.监听顶点击
    $("body").delegate(".infoTop", "click", function () {
        $(this).text(parseInt($(this).text()) + 1);
        //这里的this指向的是a标签，我们要拿到的是整条信息就用 $(this).parents(".info")
        var obj = $(this).parents(".info").get(0).obj;//获取父节点上的对象(后端接口，也就是JSON数据转化的js对象)
        // weibo.php?act=acc&id=12			顶某一条数据
        $.ajax({
            type:"get",
            url:"weibo.php",
            data:"act=acc&id="+obj.id,
            success: function (msg) {
                console.log(msg);
            },
            error: function (xhr) {
                alert(xhr.status);
            }
        });
    });
    // 3.监听踩点击
    $("body").delegate(".infoDown", "click", function () {
        $(this).text(parseInt($(this).text()) + 1);
        var obj = $(this).parents(".info").get(0).obj;
        // weibo.php?act=ref&id=12			踩某一条数据
        $.ajax({
            type:"get",
            url:"weibo.php",
            data:"act=ref&id="+obj.id,
            success: function (msg) {
                console.log(msg);
            },
            error: function (xhr) {
                alert(xhr.status);
            }
        });
    });
    // 4.监听删除点击
    $("body").delegate(".infoDel", "click", function () {
        $(this).parents(".info").remove();
        var obj = $(this).parents(".info").get(0).obj;
        // weibo.php?act=del&id=12			删除一条数据
        $.ajax({
            type:"get",
            url:"weibo.php",
            data:"act=del&id="+obj.id,
            success: function (msg) {
                console.log(msg);
            },
            error: function (xhr) {
                alert(xhr.status);
            }
        });
        // 重新获取当前这一页数据
        getMsgList($(".cur").html());//只有点击那一页，那么那页才会有cur类名，$(".cur").html()获取的是删除数据的那一页
        //上面这行代码的意思就是：重新获取删除数据那页的数据
        //不写这行代码，会出现当你删除数据时那页数据删除一个少一个后面那页的数据不会补充，而不是删除一个数据后面补充一个数据
    });
     // 5.监听页码点击
     $("body").delegate(".page>a", "click", function () {//由于动态创建的标签不能直接使用鼠标事件
    //只能使用事件委托，所以上面这代码就是事件委托形式
        $(this).addClass("cur");//点击那一页就给那一页添加个cur类名
        $(this).siblings().removeClass("cur");//排他思想，就是删除其他页的类名cur
        // console.log($(this).html());
        getMsgList($(this).html());//$(this).html()获取的是页码数，所以点击那页就获取那页的数据
        // 保存当前点击的页码
        // $.addCookie("pageNumber", $(this).html());
        window.location.hash = $(this).html();
    });
    // 创建节点方法
    function createEle(obj) {
        var $weibo = $("<div class=\"info\">\n" +
            "            <p class=\"infoText\">"+obj.content+"</p>\n" +
            "            <p class=\"infoOperation\">\n" +
            "                <span class=\"infoTime\">"+formartDate(obj.time)+"</span>\n" +
            "                <span class=\"infoHandle\">\n" +
            "                    <a href=\"javascript:;\" class='infoTop'>"+obj.acc+"</a>\n" +
            "                    <a href=\"javascript:;\" class='infoDown'>"+obj.ref+"</a>\n" +
            "                    <a href=\"javascript:;\" class='infoDel'>删除</a>\n" +
            "                </span>\n" +
            "            </p>\n" +
            "        </div>");
        return $weibo;
    }

    // 生成时间方法
    function formartDate(time) {
        var date = new Date(time*1000);//由于后端传入的时间是秒，js里是毫秒所以要*1000
        // 2018-4-3 21:30:23
        var arr = [date.getFullYear() + "-",
            date.getMonth() + 1 + "-",
            date.getDate() + " ",
            date.getHours() + ":",
            date.getMinutes() + ":",
            date.getSeconds()];
        return arr.join("");//将数组转化成字符串

    }
});
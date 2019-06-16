window.onload=window.onscroll=window.onresize = function(){

    var oDiv=document.getElementById('left_middle');
    var scrolltop=document.documentElement.scrollTop||document.body.scrollTop;
    // "scrolltop"是滚动条滚动的距离，这里有一个兼容chrome不支持document.documentElement.scrollTop获取语句，其他浏览器支持。
            var t=(document.documentElement.clientHeight-oDiv.offsetHeight)/2;
    // "t"为让广告框处于中间位置的高度距离，（获取浏览器的总高度-广告框自身高度）/2
    startMover(parseInt(t+scrolltop));
    // "parseIn"返回一个整数，避免小数生成。这里广告框的总移动距离为（t+scrolltop）
};

var timer=null;
function startMover(iTarget){
    var oDiv=document.getElementById('left_middle');
    clearInterval(timer);
    timer=setInterval(function(){
        var ispeed=(iTarget-oDiv.offsetTop)/8;

        ispeed=ispeed>0?Math.ceil(ispeed):Math.floor(ispeed);

        if(oDiv.offsetTop==iTarget){
            clearInterval(timer);
        }
        else{
            oDiv.style.top=oDiv.offsetTop+ispeed+"px";
        }

    },30);
};

var canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 600;
canvas.style.backgroundColor = "#002";
var ctx = canvas.getContext("2d");

//flying satellites around a star

var G = 1;
var M = 1;
var x = 200;
var y = 0;
var vx = 0;
var vy = -Math.sqrt(G*M/x);


var trail = [];
var dist = 0;

var calcStep = function(dt){
    var r2 = x*x+y*y;
    var a = G*M/r2;
    var r = Math.sqrt(r2);
    var ax = -a*x/r;
    var ay = -a*y/r;
    vx += ax*dt;
    vy += ay*dt;
    x += vx*dt;//+1/2*ax*dt*dt;
    y += vy*dt;//+1/2*ay*dt*dt;
    dist += Math.sqrt(vx*dt*vx*dt+vy*dt*vy*dt);
    if(flag&&y <= 0){
        return false;
    }
    return true;
};

var start = 0;
var flag = false;
var animate = function(t){
    if(start === 0)start = t;
    var dt = t - start;
    start = t;
    trail.push([x,y]);
    for(var i = 0; i < 1000; i++){
        var r = calcStep(dt/1000);
        if(!r)break;
    }
    //drawing
    ctx.clearRect(0,0,600,600);
    for(var i = trail.length-1; i > 0; i--){
        var x1 = trail[i][0]+300;
        var y1 = trail[i][1]+300;
        var x2 = trail[i-1][0]+300;
        var y2 = trail[i-1][1]+300;
        var col = 255-Math.floor(trail.length-i);
        col = col < 100?100:col;
        ctx.strokeStyle = "rgb("+col+","+col+","+col+")";
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x+300,y+300,3,0,6.28);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300,300,6,0,6.28);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign="left";
    ctx.font="20px Arial";
    ctx.fillText("PI="+(dist/200/2),20,20);
    ctx.font="10px Arial";
    ctx.fillText(("t+ "+(t/1000)).slice(0,11),20,35);
    ctx.fillText(("x= "+x),20,50);
    ctx.fillText(("y= "+y),20,65);
    ctx.fillText(("vx= "+vx),20,80);
    ctx.fillText(("vy= "+vy),20,95);
    ctx.fillText(("G=1"),20,110);
    ctx.fillText(("M=1"),20,125);
    var a = G*M/40000;
    ctx.fillText(("a=G*M/r2"),20,140);
    ctx.fillText(("a= "+a),20,155);
    ctx.fillText(("ax= "+(-a*x/r)),20,170);
    ctx.fillText(("ay= "+(-a*y/r)),20,185);
    if(flag&&y <= 0){
        return false;
    }
    if(y > 0){
        flag = true;
    }
    requestAnimationFrame(animate);
};

requestAnimationFrame(animate);
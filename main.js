var Track = function(){
    var head = [];
    var tail = [];
    head[3] = false;//prev
    head[4] = tail;//next
    tail[3] = head;
    tail[4] = false;
    this.addCoord = function(x,y,t){
        var prev = tail[3];
        var next = tail;
        var newNode = [x,y,t,prev,next];
        prev[4] = newNode;
        next[3] = newNode;
    };
    this.tick = function(dt){
        var node = head[4];
        while(node !== tail){
            node[2] -= dt;
            if(node[2] < 0){
                //delete the node
                var prev = node[3];
                var next = node[4];
                prev[4] = next;
                next[3] = prev;
            }
            node = node[4];
        }
    };
    this.itr = function(func){
        var node = head[4];
        if(node === tail)return false;
        var nextNode = node[4];
        while(nextNode !== tail){
            func(node,nextNode);
            node = nextNode;
            nextNode = nextNode[4];
        }
    };
};


var G = 500000;

var GravitySimulation = function(canvas){
    var objs = {};
    var sigma = 1;
    var idd = 0;
    var genid = function(){
        return idd++;
    };
    this.add = function(vals){
        var id = genid();
        vals.id = id;
        objs[id] = vals
        return vals;
    };
    this.remove = function(vals){
        var id = vals.id;
        if(id in objs){
            delete objs[id];
        }
    };
    this.step = function(dt){
        for(var i in objs){
            var obj1 = objs[i];
            if(obj1.fixed)continue;
            var fx = 0;
            var fy = 0;
            for(var j in objs){
                if(i === j)continue;
                var obj2 = objs[j];
                if(obj2.m === 0)continue;//if mass is 0 no need to calculate
                var dx = obj2.x-obj1.x;
                var dy = obj2.y-obj1.y;
                var r2 = dx*dx+dy*dy;
                var r = Math.sqrt(r2);
                var f = G*obj1.m*obj2.m/(r2+sigma);
                fx += f*dx/r;
                fy += f*dy/r;
            }
            var ax = fx/obj1.m;
            var ay = fy/obj1.m;
            obj1.vx += ax*dt;
            obj1.vy += ay*dt;
            obj1.x += obj1.vx*dt;
            obj1.y += obj1.vy*dt;
        }
    };
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext("2d");
    this.draw = function(dt){
        ctx.clearRect(0,0,width,height);
        for(var i in objs){
            var obj = objs[i];
            var x = obj.x;
            var y = obj.y;
            var r = obj.r;
            var id = obj.id;
            ctx.beginPath();
            ctx.arc(x,y,r,0,6.28);
            ctx.fillStyle = "#fff";
            ctx.fill();
            if(obj.isTrack){
                if(!obj.track)obj.track = new Track();
                var track = obj.track;
                track.tick(dt);
                var ttt = 3;
                track.addCoord(x,y,ttt);
                if(obj.lw)ctx.lineWidth = obj.lw;
                track.itr((n1,n2)=>{
                    var t = n1[2];
                    //console.log(n1,n2);
                    var col = Math.floor(t/ttt*255);
                    var col1 = Math.floor(256/16*2+col*(14/16));
                    ctx.strokeStyle = "rgb("+col+","+col+","+col1+")";
                    ctx.beginPath();
                    ctx.moveTo(n1[0],n1[1]);
                    ctx.lineTo(n2[0],n2[1]);
                    ctx.stroke();
                });
                ctx.lineWidth = 1;
            }
        }
    };
};

var dist = function(a,b){
    return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
};
var distVect = function(a,b){
    return Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]));
};

var canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 600;
canvas.style.backgroundColor = "#002";
var ctx = canvas.getContext("2d");
var sim = new GravitySimulation(canvas);

var centerO = sim.add({
    x:300,
    y:300,
    vx:3,
    vy:-10,
    m:10,
    r:5,
    isTrack:true
});

var mainSat = sim.add({
    x:500,
    y:300,
    vx:-30,
    vy:100,
    m:1,
    r:3,
    isTrack:true
});


sim.add({
    x:400,
    y:300,
    vx:111,
    vy:100,
    m:0.00001,
    r:2,
    lw:0.2,
    isTrack:true
});


for(var i = 0; i < 3; i++){
    for(var j = 0; j < 3; j++){
        sim.add({
            x:500+(i-1.5)*60,
            y:300+(j-1.5)*20,
            vx:120,
            vy:100,
            m:0.0000001,
            r:1,
            lw:0.1,
            isTrack:true
        });
    }
}

var orbits = 0;
var previousPerigee = -10;
var start = 0;
var apogee = 0;
var perigee = 0;
var pi = "uncalculated";
var prevR = dist(mainSat,centerO);
var drdt = -1;//decreasing
var animate = function(t){
    t = t/1000;
    if(start === 0)start = t;
    var dt = (t-start);
    start = t;
    for(var i = 0; i < 1000; i++){
        sim.step(dt/1000);
        if(t < 0.5)continue;
        var tnow = (t+i*dt/1000);
        var r = dist(mainSat,centerO);
        var drdtnow = r-prevR;
        var drdtold = drdt;
        drdt = drdtnow;
        prevR = r;
        if(drdtnow < 0 && !(drdtold < 0)){
            //found apogee
            console.log("apogee");
            apogee = r;
        }else if(!(drdtnow < 0) && drdtold < 0){
            //found perigee
            console.log("perigee");
            perigee = r;
            if(previousPerigee === -10){
                previousPerigee = tnow;
            }else{
                var T = tnow-previousPerigee;
                previousPerigee = tnow;
                var semiMajorAxis = (apogee+perigee)/2;
                //console.log(apogee,perigee,semiMajorAxis,T)
                pi = Math.sqrt(T*T*G*(centerO.m+mainSat.m)/semiMajorAxis/semiMajorAxis/semiMajorAxis/4);
                console.log(pi);
            }
        }
        
        
        /*
        if(mainSat.x < 300){
            //console.log("adfasd");
            countFlag = true;
        }
        if(countFlag && mainSat.y > 320 && mainSat.x > 320){
            var T;
            if(passStart === -10){
                passStart = t+i*dt/1000;
            }else{
                orbits++;
                Tsum = (t+i*dt/1000)-passStart;
                T = Tsum/orbits;
                var r = dist(mainSat,centerO);
                var pi = Math.sqrt(T*T*G*centerO.m/r/r/r/4);
                //console.log(t);
                console.log(passStart,T,Tsum,pi);
            }
            console.log(orbits);
            countFlag = false;
        }*/
    }
    sim.draw(dt);
    ctx.textAlign="left";
    ctx.font="20px Arial";
    ctx.fillText("PI="+pi,20,20);
    ctx.font="10px Arial";
    ctx.fillText(("t+ "+t).slice(0,11),20,35);
    ctx.fillText(("x= "+mainSat.x),20,50);
    ctx.fillText(("y= "+mainSat.y),20,65);
    ctx.fillText(("vx= "+mainSat.vx),20,80);
    ctx.fillText(("vy= "+mainSat.vy),20,95);
    ctx.fillText(("G="+G),20,110);
    ctx.fillText(("M="+centerO.m),20,125);
    ctx.fillText(("m="+mainSat.m),20,140);
    ctx.fillText(("a=G*M/r2"),20,155);
    requestAnimationFrame(animate);
};

requestAnimationFrame(animate);
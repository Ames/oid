

var container;
var myShip;

var dims={w:0,h:0};

var keys={};

var things=[];
var bullets=[];
var rocks=[];

var dt=1/30; //time step, seconds.

var numRocks=6;

var boom=50;
var rockInitial=100;
var rockMin=40;
var rockFactor=.6;
var rockChilderen=2;
var rockChars=['&#9827;','&#9824;','&#9829;','&#9830;'];

var bulletFrequency=6;
var bulletWait=0;

var rainbowMode=false;

var score=0;
var lives=3;

var scoreBox;
var lifeBox;

function init(){
	container=document.getElementById("container");

	scoreBox=new textBox();
	lifeBox=new textBox();
	
	scoreBox.div.style.fontFamily="Courier New, Courier New, monospace";

	window.onresize=resize;
	document.onkeydown=keyDown;
	document.onkeyup=keyUp;
	window.onblur=windowBlur;
	
	resize();
	
	setInterval('step()',dt*1000);

	myShip=new Ship();
	
	spawnRocks(numRocks);
	
	upScore();
	upLives();
}

function upLives(){
	var str="";
	if(lives>0){
		for(var i=0;i<lives;i++){
			str+='A';
		}
	}else{
		str+='A*('+lives+')';	
	}
	
	lifeBox.up(str);
}

function upScore(){
	var str="";
	scoreBox.up(Math.round(score));
}

function spawnRocks(num){
	
	for(var i=0;i<num;i++){
	//new Bullet(0,0,0,0,60);
	new Rock(
		rand(0,dims.w),
		rand(0,dims.h),
		rand(-boom,boom),
		rand(-boom,boom),
		rand(0,Math.PI*2),
		rockInitial);
	}
}

function keyDown(e){
	keys[e.which]=true;
	
	if(keys[83]&& //s
	   keys[68]&& //d
	   keys[70]&& //f
	   keys[74]&& //j
	   keys[75]&& //k
	   keys[76]){ //l
	   
		if(bulletFrequency<1000){
			halo(myShip.x,myShip.y);
		}

		bulletFrequency=100000;
		rainbowMode=true;
	}
}

function keyUp(e){
	keys[e.which]=false;
	
	if(e.which==32){ //space
		bulletWait=0;
	}
}
function windowBlur(){
	keys=[];
}
function resize(e){
	if(container){
		dims.h=container.clientHeight;
		dims.w=container.clientWidth;
	}
}

function step(){
	
	for(var i in things){
		if(!things[i].removed){
			things[i].up();
		}
	}
	
	//check for collisions, do collisions!
	for(var i in rocks){
		var r=rocks[i ];
		for(var j in bullets){
			var b=bullets[j];
			
			if(!b.removed && !r.removed &&
				Math.dist(r.x-b.x,r.y-b.y)<r.size/2){//collision!
				
				b.remove();
				r.remove();
				
				//score+=r.size;
				score+=rand(1,10);
				scoreBox.up(Math.round(score));
				
				explosion(r.x,r.y,r.size/2)
				
				if(r.size>rockMin){
					
					var rockChilderens=rockChilderen+(Math.random()<.3);
					
					for(var n=0;n<rockChilderens;n++){
						new Rock(r.x,r.y,r.vx+rand(-boom,boom),r.vy+rand(-boom,boom),rand(0,Math.PI*2),r.size*rockFactor);
					}
				}
			}
		}
		
		
		if(!r.removed && Math.dist(r.x-myShip.x,r.y-myShip.y)<(r.size/2)){//collision!
			explosion(myShip.x,myShip.y,500);
			lives--;
			myShip.x=dims.w/2;
			myShip.y=dims.h/2;
			myShip.vx=0;
			myShip.vy=0;
			myShip.a=0;
			upLives();
			document.body.style.backgroundColor='grey';
			setTimeout("document.body.style.backgroundColor='black';",1);
		}
	}
	
	
	//clean up dead things
	cull(things);
	cull(bullets);
	cull(rocks);
	
	if(!rocks.length){
		numRocks+=3;
		spawnRocks(numRocks);
		lives++;
		upLives();
	}
}

function cull(arr){
	for(var i=arr.length-1;i>=0;i--){
		if(arr[i].removed){
			arr.splice(i,1);
		}
	}
}

function explosion(x,y,n){
	for(var i=0;i<n;i++){
		var a=rand(0,360);
		var r=rand(0,boom)*5;
		new Spark(x,y,Math.cos(a)*r,Math.sin(a)*r,rand(.1,.4));
	}
}

function halo(x,y){
	var n=50;
	var v=300;
	var t=1;
	for(var i=0;i<n;i++){
		var a=i/n*Math.PI*2;
		new Spark(x,y,v*Math.cos(a),v*Math.sin(a),t);
	}
}

//ship class
function Ship(){
	
	this.inheritFrom = Thing;
	//this.inheritFrom(dims.w/2,dims.h/2,0,0,30,0,'ship','Д');
	this.inheritFrom(dims.w/2,dims.h/2,0,0,30,0,'ship','A');
	
	var jetForce=600;
	var turnSpeed=4;
	
	var bulletVel=200;
	var bulletLife=2;

	var frict=1;

	this.fire=function(){
		new Bullet(this.x,this.y,
			this.vx+bulletVel*Math.sin(this.a),
			this.vy-bulletVel*Math.cos(this.a),bulletLife);
	}
	
	this.up=function(){
		if(keys[38]){ //up
			this.vx+=Math.sin(this.a)*jetForce*dt;
			this.vy-=Math.cos(this.a)*jetForce*dt;
			
			for(var i=0;i<5;i++){
				new Spark(this.x,this.y,
					this.vx-rand(100,200)*Math.sin(this.a),
					this.vy+rand(100,200)*Math.cos(this.a),rand(0,.3)*(rainbowMode?5:1));
			}
		}
		
		if(keys[39]){ //right
			this.a+=turnSpeed*dt;
		}
		
		if(keys[37]){ //left
			this.a-=turnSpeed*dt;
		}
		
		if(keys[32]){
			bulletWait-=dt;
			if(bulletWait<=0){
				bulletWait=1/bulletFrequency;
				this.fire();
			}
		}
		
		this.vx-=this.vx*frict*dt;
		this.vy-=this.vy*frict*dt;
		
		this.step();
		this.upLoc();
		this.upRot();
	}

}

//bullet class
function Bullet(x0,y0,vx0,vy0,time){
	
	this.inheritFrom = Thing;
	this.inheritFrom(x0,y0,vx0,vy0,20,Math.atan2(-vx0,vy0),'bullet','.');

	this.t=time||2;
	
	this.upRot();
		
	this.up=function(){
		
		this.step();
		this.upLoc();

		this.t-=dt;
		
		if(this.t<0){
			this.remove();	
		}
	}
	
	this.up();
	bullets.push(this);
}

//rock class
function Rock(x0,y0,vx0,vy0,a,size){
   
   	this.inheritFrom = Thing;
	//this.inheritFrom(x0,y0,vx0,vy0,size,a,'rock','');
	//this.inheritFrom(x0,y0,vx0,vy0,size,a,'rock','&#63743;');
	this.inheritFrom(x0,y0,vx0,vy0,size,a,'rock',rockChars[Math.floor(rand(0,rockChars.length))]);

	this.upRot();
	
    this.up=function(){
    	this.step();
    	this.upLoc();
    }

    this.up();
    
    rocks.push(this);
}

// the future:
function Thing(x,y,vx,vy,size,angle,className,content){
	
	this.x=x;
	this.y=y;
	this.vx=vx;
	this.vy=vy;
	this.size=size;
	this.a=angle;
	
	this.removed=false;
	
	this.div=document.createElement('div');
	this.div.className=className||"";
	this.div.innerHTML=content||"";
	this.div.style.fontSize=this.size+'px';
	
    container.appendChild(this.div);
    
    this.step=function(){
    	this.x+=this.vx*dt;
    	this.y+=this.vy*dt;
    	
    	this.x=(this.x+dims.w)%dims.w;
		this.y=(this.y+dims.h)%dims.h;

    }
	this.upLoc=function(){
		this.div.style.top=n2s(this.y)+'px';
		this.div.style.left=n2s(this.x)+'px';
	}
	this.upRot=function(){
		//we should probably pick one of these (browser detect)
		this.div.style.setProperty('-webkit-transform','rotate('+n2s(this.a)+'rad)',"");
		this.div.style.setProperty('-moz-transform','rotate('+n2s(this.a)+'rad)',"");
		this.div.style.setProperty('-o-transform','rotate('+n2s(this.a)+'rad)',"");
	}
	
	this.remove=function remove(){
		if(!this.removed){
			this.removed=true;
			container.removeChild(this.div);
		}
	}
	
	things.push(this);
}


//bullet class
function Spark(x0,y0,vx0,vy0,time){
	
	this.inheritFrom = Thing;
	this.inheritFrom(x0,y0,vx0,vy0,8,0,'bullet',rainbowMode?'#':'.');

	this.t=time;
	
	//rainbow!
	if(rainbowMode){
		//this.div.style.color="hsl("+rand(0,360)+",100%,70%)"
		this.div.style.color="hsl("+((Date.now()/3)%360)+",100%,75%)"
	}
	
	this.up=function(){

		this.step();
		this.upLoc();

		this.t-=dt;
		
		if(this.t<0){
			this.remove();	
		}
	}
	
	this.up();

}

function textBox(){
	this.div=document.createElement('div');
	this.div.className="textBox";
    container.appendChild(this.div);
    
    this.up=function(txt){
    	this.div.innerHTML=txt;
    }
}


Math.dist=function(a,b){
	return Math.sqrt(a*a+b*b);
}
function rand(min,max){
	return Math.random()*(max-min)+min;
}
function n2s(n){
	return Math.round(n*10)/10;	
}

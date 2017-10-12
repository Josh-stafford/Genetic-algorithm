var population;
var target;
var count = 0;
var lifespan = 200;
var lifeP;
var genP;
var genCount = 1;
var obstacles;
var fitP;
var alive = 100;
var aliveP;

function setup(){
  createCanvas(400, 500);
  population = new Population();
  target = createVector(width/2, 50);
  lifeP = createP();
  genP = createP();
  fitP = createP();
  aliveP = createP();
  obstacle1 = {
    pos: createVector((width/2)-125, (height/2) + 100),
    width: 250,
    height: 20
  };
  obstacle2 = {
    pos: createVector((width/2)-100, (height/2) - 100),
    width: 150,
    height: 60
  };
  obstacle3 = {
    pos: createVector((width/2)+40, (height/2) - 100),
    width: 30,
    height: 150
  };
  obstacle4 = {
    pos: createVector((width/2)-80, 10),
    width: 30,
    height: 100
  };

  obstacles = [obstacle1, obstacle2, obstacle3, obstacle4];
}

function draw(){
  background(51);
  population.run()
  noStroke();
  fill(0, 255, 0);
  ellipse(target.x, target.y, 30, 30);
  lifeP.html(count);
  count++;
  genP.html(genCount);
  fill(255);
  for(var i = 0; i < obstacles.length; i++){
    current = obstacles[i];
    rect(current.pos.x, current.pos.y, current.width, current.height);
  }
  if(count >= lifespan){
    population.evaluate();
    population.selection();
    count = 0;
    genCount += 1;
    alive = 100;
  }
}

function Rocket(dna){
  this.pos = createVector(width/2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.moving = true;
  this.dead = false;
  if(dna){
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.fitness = 0;

  Rocket.prototype.applyForce = function(force){
    this.acc.add(force);
  }

  Rocket.prototype.update = function(){
    this.hit();
    if(this.moving){
      this.applyForce(this.dna.genes[count]);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }

    if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height || dist(this.pos.x, this.pos.y, target.x, target.y) < 10){
      this.moving = false;
    }
    
    if(!this.moving && !this.dead){
      alive -= 1;
      aliveP.html(alive);
      this.dead = true;
    }
  }

  Rocket.prototype.hit = function(){
    for(var i = 0; i < obstacles.length; i++){
      current = obstacles[i];
      if(this.pos.y < current.pos.y + current.height && this.pos.y > current.pos.y && this.pos.x > current.pos.x && this.pos.x < current.pos.x + current.width){
        this.moving = false;
        return 1;
      }
    }

  }

  Rocket.prototype.show = function(){
    push();
    translate(this.pos.x, this.pos.y);
    noStroke();
    rotate(this.vel.heading());
    rectMode(CENTER);
    fill(255, 0, 0, 150);
    rect(0, 0, 25, 5);
    pop();
  }

  Rocket.prototype.calcFitness = function(){
    if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height){
      this.fitness = 0.1;
    } else if(dist(this.pos.x, this.pos.y, target.x, target.y) < 10){
      this.fitness = 1000;
      console.log("Success!");
    } else if(this.hit()){
      this.fitness = 0.1;
    } else {
      var d = dist(this.pos.x, this.pos.y,  target.x, target.y);

      this.fitness = map(d, 0, width, width, 0);
    }

  }

}

function Population(){
  this.popsize = 100;
  this.rockets = [];
  this.matingpool = [];

  for(var i = 0; i < this.popsize; i++){
    this.rockets[i] = new Rocket();
  }

  Population.prototype.run = function(){
    for(var i = 0; i < this.rockets.length; i++){
      this.rockets[i].update();
      this.rockets[i].show();
    }
  }

  Population.prototype.evaluate = function(){
    this.maxfit = 0;
    for(var i = 0; i < this.popsize; i++){
      this.rockets[i].calcFitness();
      if(this.rockets[i].fitness > this.maxfit){
        this.maxfit = this.rockets[i].fitness;
      }
    }
    fitP.html(this.maxfit);
    this.matingpool = [];

    for(var i = 0; i < this.popsize; i++){
      this.rockets[i].fitness /= this.maxfit;
      var n = this.rockets[i].fitness * 100;
      for(var j = 0; j < n; j++){
        this.matingpool.push(this.rockets[i]);
      }
    }
  }

  Population.prototype.selection = function(){
    var newRockets = [];
    for(var i = 0; i < this.popsize; i++){
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;
      var child = parentA.crossover(parentB);
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }

}

function DNA(genes){
  if(genes){
    this.genes = genes;
  } else {
    this.genes = [];
    for(var i = 0; i < lifespan; i++){
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(0.6);
    }
  }


  DNA.prototype.crossover = function(partner){
    var newgenes = [];
    var mutation = random(0.1,100);
    var mid = floor(random(this.genes.length));
    for(var i = 0; i < this.genes.length; i++){
      if(mutation < 1){
        newgenes[i] = p5.Vector.random2D();
        mutation = random(0.1,100);
      } else if (i > mid){
         newgenes[i] = (this.genes[i]);
      } else {
        newgenes[i] = (partner.genes[i]);
      }
    }
    return new DNA(newgenes);
  }
}

var player;
var enemyList = {};
var upgradeList = {};
var bulletList = {};

Entity = function(type, id, x, y, width, height, img){
    var self = {
        type:type,
        id:id,
        x:x,
        y:y,
        width:width,
        height:height,
        img:img,
        };

    self.update = function(){
        self.updatePosition();
        self.draw();
    }

    self.updatePosition = function(){  
        }    

    self.draw = function(){
        ctx.save();

       var x = self.x - player.x;
        var y = self.y - player.y;

        x += WIDTH/2;
        y += HEIGHT/2;

        x -= self.width/2;
        y -= self.height/2;


        ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height );
        ctx.restore();
        }

    self.getDistance = function(entity2){
        var dx = self.x - entity2.x;
        var dy = self.y - entity2.y;
        return Math.sqrt(dx*dx + dy*dy);
        } 

    self.testCollision = function(entity2){
        var entity1 = {
            x:self.x - self.width/2,
            y:self.y - self.height/2, 
            width: self.width,
            height:self.height,
        }
        var entity2 = {
                x:entity2.x - entity2.width/2,
                y:entity2.y - entity2.height/2, 
                width: entity2.width,
                height:entity2.height,
                }
        return testCollisionRectangles(entity1,entity2);
        }
    return self;
}

Actor = function(type, id, x , y, width, height, img, hp, attackSpeed){
    var self = Entity(type, id, x , y, width, height, img);

    self.hp = hp;
    self.hpMax = hp;
    self.attackSpeed = attackSpeed;
    self.attackCounter = 1;
    self.aimAngle = 0;

    var super_update = self.update;
    self.update = function() {
        super_update();
        self.attackCounter += self.attackSpeed;
        if (self.hp <= 0){
            self.onDeath();
        }
    }

    self.performAttack = function(){
    if(self.attackCounter > 25){  // Every 1 second
        self.attackCounter = 0;
        generateBullet(self);
        }
    }

    self.performSpecialAttack = function(){
    if(self.attackCounter > 50){  // Every 2 second
        self.attackCounter = 0;
        generateBullet(self, self.aimAngle - 5);
        generateBullet(self, self.aimAngle);
        generateBullet(self, self.aimAngle + 5);        
        }
    }

    self.onDeath = function(){
        /*if (self.type === 'player'){
            var timeSurvived = Date.now() - timeWhenGameStarted;
            console.log("You lost! You survived for " + timeSurvived + "ms");
            startNewGame();
        }

        else if (self.type === 'enemy'){
            console.log("You killed an enemy!");
            delete enemyList[self.id];    
        }*/
    }
    return self;
}

Player = function(){ 
    var self = Actor('player','MyID', 250, 250, 50, 70, Img.player, 10, 1);

    self.pressDown = false;
    self.pressUp = false;
    self.pressLeft = false;
    self.pressRight = false;

    self.pressMouseLeft = false;
    self.pressMouseRight = false;

    var super_update = self.update;
    self.update = function(){
        super_update();
        if (self.pressMouseLeft)
            self.performAttack();
        if (self.pressMouseRight)
            self.performSpecialAttack();
    }

    self.updatePosition = function(){
        if(self.pressRight)
            self.x += 10;
        if(self.pressLeft)
            self.x -= 10;
        if(self.pressUp)
            self.y -= 10;
        if(self.pressDown)
            self.y += 10;

        if(self.x < self.width/2)
            self.x = self.width/2;
        if(self.x > currentMap.width - self.width/2)
            self.x = currentMap.width - self.width/2;
        if(self.y < self.height/2)
            self.y = self.height/2;
        if (self.y > currentMap.height - self.height/2)
            self.y = currentMap.height - self.height/2;
            }

    self.onDeath = function(){
        var timeSurvived = Date.now() - timeWhenGameStarted;
        console.log("You lost! You survived for " + timeSurvived + "ms");
        startNewGame();  
    }
 
    return self;
}

Enemy = function(id, x , y, width, height, img, hp, attackSpeed){
    var self = Actor('enemy', id, x, y, width, height, img, hp, attackSpeed);
    

    var super_update = self.update;
    self.update = function(){
        var toRemove = false;
        super_update();
        self.performAttack();
        self.updateAim();
    }

    var super_draw = self.draw;
    self.draw = function(){
        super_draw();
        var x = self.x - player.x + WIDTH/2;
        var y = self.y - player.y + HEIGHT/2 - self.height/2 - 20;
        ctx.save();
        ctx.fillStyle = 'red';
        var bar = 100 * self.hp / self.hpMax;
        if (bar < 0) 
            bar = 0;
        ctx.fillRect(x - 50, y, bar, 10);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x - 50, y, 100, 10);
        ctx.restore();

    }

    self.updatePosition = function(){
        var diffX = player.x - self.x;
        var diffY = player.y - self.y;
        self.aimAngle = Math.atan2(diffY, diffX) / Math.PI * 180;

        if (diffX > 0)
            self.x += 3;
        else 
            self.x -= 3;

        if (diffY > 0)
            self.y += 3;
        else 
            self.y -= 3;
    }

    self.updateAim = function(){
        var diffX = player.x - self.x;
        var diffY = player.y - self.y;
        self.aimAngle = Math.atan2(diffY, diffX) / Math.PI * 180;
    }

    self.onDeath = function(){
        delete enemyList[self.id];    
    }

    enemyList[id] = self;
}

Upgrade = function(id, x , y, width, height , img, category){
    var self = Entity('upgrade', id, x, y, width, height, img);
    self.category = category;
   
    var super_update = self.update;
    self.update = function(){
        super_update();
        var isColliding = player.testCollision(self)
            if (isColliding){
                if (self.category === 'score')
                    score += 1000;
                if (self.category === 'attack')
                    player.attackSpeed += 3;

                delete upgradeList[self.id]
            }
        }
    upgradeList[id] = self;
}

Bullet = function(id, x , y, spdX, spdY,  width, height, combatType){
    var self = Entity('bullet', id, x, y , width, height, Img.bullet);
    
    self.timer = 0;
    self.combatType = combatType;
    self.spdX = spdX;
    self.spdY = spdY;

    var super_update = self.update;
    self.update = function(){
        super_update();
        var toRemove = false;
        self.timer++;
        if (self.timer > 100){
            toRemove = true;
            }

        if (combatType === 'player'){    
            for(var key in enemyList){
                if (self.testCollision(enemyList[key])){;
                    //if (isColliding){
                    toRemove = true;
                    enemyList[key].hp -= 1;
                    //if (enemyList[key].hp <= 0){
                    //    //delete enemyList[key];
                    //    enemyList[key].onDeath();
                   // }
                   }
               }
            }
        else if (combatType === 'enemy'){
            if (self.testCollision(player)){
                toRemove = true;
                player.hp -= 1;
                //if (player.hp <= 0){
                //        player.onDeath();
               // }
            }
        }   

        if (toRemove)
            delete bulletList[self.id];
        }

    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
        if (self.x < 0  || self.x > currentMap.width || self.y < 0 || self.y > currentMap.height)
            delete bulletList[self.id];
    }

    bulletList[id] = self;
}
  
randomGenerateEnemy = function (){
    var x = Math.random() * currentMap.width;
    var y = Math.random() * currentMap.height;
    var width = 64; //10 + Math.random() * 30;
    var height = 64; //10 + Math.random() * 30;
    var id = Math.random();
    //var spdX = 5 + Math.random() * 5;
    //var spdY = 5 + Math.random() * 5;
    if(Math.random() < 0.5)
        Enemy(id, x, y, width, height, Img.bat, 5, 1);
    else
        Enemy(id, x, y, width, height, Img.bee, 2, 3);
}

randomGenerateUpgrade = function (){
    var x = Math.random() * currentMap.width;
    var y = Math.random() * currentMap.height;
    var width = 32;
    var height = 32; 
    var id = Math.random();
    //var spdX = 0;
    //var spdY = 0;

    if (Math.random() < 0.5){
        var category = 'score';
        var img = Img.upgrade1;
    }

    else {
        var category = 'attack';
        var img = Img.upgrade2;
    }
    Upgrade(id, x, y, width, height, img, category);
}

generateBullet = function (actor, overwriteAngle){
    var x = actor.x;
    var y = actor.y;
    var width = 32; //10;
    var height = 32; //10; 
    var id = Math.random();
    var angle = actor.aimAngle;
    if (overwriteAngle != undefined)
        angle = overwriteAngle;
    var spdX = Math.cos(angle/180*Math.PI)*5;
    var spdY = Math.sin(angle/180*Math.PI)*5;
    var img = Img.bullet;
    var timer = 0;
   Bullet(id, x, y, spdX, spdY, width, height, actor.type);
}

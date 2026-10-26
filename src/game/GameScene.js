import Phaser from 'phaser';
import { bus, emit } from '../core/bus.js';
import { getFloor } from '../content/floors.js';
import { sound } from '../core/sound.js';
import { loadProgress } from '../state/progress.js';
const W = 1180; const H = 540;
const STICK = 1080;
const SPEED = 215; const SPRINT = 285; const JUMP = 410;
export class GameScene extends Phaser.Scene {
  constructor() { super('TowerScene'); this.floor = 0; this.isLocked = false; this.virtual = {left:false,right:false,jump:false}; }
  create() {
    const persisted = loadProgress();
    const initialFloor = this.registry.get('floor');
    this.floor = initialFloor === undefined ? persisted.currentFloor : initialFloor;
    this.room = getFloor(this.floor);
    this.isLocked = document.body.classList.contains('dialog-open');
    this.state = 'idle'; this.frameNo = 0;
    this.virtual = {left:false,right:false,jump:false};
    this.floorSolved = initialFloor === undefined ? persisted.completed.includes(this.floor) : Boolean(this.registry.get('solved'));
    this.registry.set('floor', this.floor);
    this.registry.set('solved', this.floorSolved);
    this.drawBackdrop();
    this.physics.world.setBounds(0,0,W,H);
    this.cameras.main.setBounds(0,0,W,H);
    this.cameras.main.setBackgroundColor('#080e1c');
    this.platforms = this.physics.add.staticGroup();
    this.addPlatform(W/2, 497, W, 76);
    this.addPlatform(365, 395, 155, 13);
    this.addPlatform(620, 345, 150, 13);
    // Physics body is transparent. Graphics provide original stickman animation.
    if (!this.textures.exists('stick-hitbox')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff,1);
      graphics.fillRect(0,0,27,65);
      graphics.generateTexture('stick-hitbox',27,65);
      graphics.destroy();
    }
    this.actor = this.physics.add.sprite(110, 420, 'stick-hitbox');
    this.actor.setAlpha(0).setDepth(5);
    this.actor.body.setSize(24,59).setOffset(1,4);
    this.actor.setCollideWorldBounds(true);
    this.actor.setMaxVelocity(360,600);
    this.physics.add.collider(this.actor, this.platforms);
    this.avatar = this.add.graphics().setDepth(7);
    this.drawTerminal(); this.drawElevator();
    this.prompt = this.add.text(0,0,'', {fontFamily:'monospace',fontSize:'12px',color:'#8fffe4',backgroundColor:'#0a1d30',padding:{x:8,y:5}}).setDepth(10).setVisible(false);
    this.cameras.main.startFollow(this.actor,true,.09,.09,0,30);
    this.keys = this.input.keyboard?.addKeys('A,D,W,LEFT,RIGHT,UP,SPACE,E,SHIFT,ESC');
    this.listeners = [
      ['game:floor',(event)=>{this.registry.set('floor',event.detail.floor);this.registry.set('solved',Boolean(event.detail.solved));this.scene.restart();}],
      ['game:solved',()=>{this.registry.set('solved',true);this.floorSolved=true;this.redrawDoor();}],
      ['game:lock',(event)=>{this.isLocked=Boolean(event.detail.locked);if(this.isLocked) this.actor.setVelocityX(0);}],
      ['game:control',(event)=>{const {name,pressed}=event.detail;if(name==='interact' && pressed) this.interact();else if(name in this.virtual)this.virtual[name]=pressed;}],
    ];
    for (const [name,fn] of this.listeners) bus.addEventListener(name,fn);
    this.events.once('shutdown',()=>{for (const [name,fn] of this.listeners)bus.removeEventListener(name,fn);});
    emit('game:ready',{floor:this.floor});
  }
  drawBackdrop() {
    this.add.rectangle(W/2,H/2,W,H,0x080e1c);
    const grid = this.add.graphics(); grid.lineStyle(1,0x1a2c42,.55);
    for(let x=0;x<W;x+=56){grid.lineBetween(x,0,x,H);}
    for(let y=0;y<H;y+=56){grid.lineBetween(0,y,W,y);}
    this.add.rectangle(W/2,90,W,4,0x173453,.9);
    const moon = this.add.graphics(); moon.lineStyle(1,0x34637f,.55);
    moon.strokeCircle(870,180,130);moon.strokeCircle(870,180,85);moon.strokeCircle(870,180,45);
    for(let x=60;x<W;x+=160){
      this.add.rectangle(x,310,46,220,0x0e1b2d,.88).setOrigin(.5,.5);
      for(let y=245;y<398;y+=33)this.add.rectangle(x,y,18,13,0x1b3650,.5);
    }
    this.add.text(44,48,'SECTOR 01  /  THE AWAKENING',{fontFamily:'monospace',fontSize:'14px',color:'#587f9a',letterSpacing:3});
    this.add.text(46,70,'FLOOR '+String(this.floor).padStart(2,'0')+' : '+this.room.title.toUpperCase(),{fontFamily:'monospace',fontSize:'18px',color:'#dcecff',letterSpacing:2});
    if(this.floor===10) this.add.text(720,112,'⚠ CORE INSTABILITY DETECTED',{fontFamily:'monospace',fontSize:'13px',color:'#ff7c85'});
    this.add.rectangle(W/2,490,W,20,0x172f40,.96).setDepth(1);
    const stripe=this.add.graphics().setDepth(2);stripe.lineStyle(2,0x2f5770,.8);stripe.lineBetween(0,455,W,455);
    for(let x=0;x<W;x+=45)stripe.lineBetween(x,478,x+21,478);
    this.add.text(90,295,'404',{fontFamily:'monospace',fontSize:'56px',color:'#172e46'}).setRotation(-.14);
    this.add.text(1020,286,'// EXIT',{fontFamily:'monospace',fontSize:'16px',color:'#2c536b'});
  }
  addPlatform(x,y,w,h){const p=this.add.rectangle(x,y,w,h,0x21435b).setDepth(3);this.physics.add.existing(p,true);this.platforms.add(p);this.add.rectangle(x,y-h/2,w,3,0x5697ac).setDepth(4);}
  drawTerminal(){
    const x=750;
    this.add.rectangle(x,383,112,109,0x132439).setStrokeStyle(2,0x40c9b1).setDepth(2);
    this.add.rectangle(x,380,94,78,0x08151d).setDepth(3);
    this.add.text(x,345,'< / >',{fontSize:'25px',fontFamily:'monospace',color:'#79f5d1'}).setOrigin(.5).setDepth(4);
    this.add.text(x,382,'TERMINAL', {fontFamily:'monospace',fontSize:'12px',color:'#a8dcd6'}).setOrigin(.5).setDepth(4);
    this.add.text(x,408,'E · CONNECT',{fontFamily:'monospace',fontSize:'10px',color:'#53a992'}).setOrigin(.5).setDepth(4);
    this.add.rectangle(x,451,16,30,0x19344b).setDepth(2);
    this.add.text(x-56,302,'STATION // '+String(this.floor).padStart(2,'0'),{fontFamily:'monospace',fontSize:'11px',color:'#4bbfa5'});
  }
  drawElevator(){
    this.doorG=this.add.graphics().setDepth(3);this.redrawDoor();
    this.add.text(STICK,305,'ASCENT LIFT',{fontFamily:'monospace',fontSize:'13px',color:'#becddd'}).setOrigin(.5);
  }
  redrawDoor(){
    if(!this.doorG)return;
    const x=STICK; const safe=this.floorSolved;
    this.doorG.clear();this.doorG.fillStyle(0x101f31,1).fillRoundedRect(x-47,327,94,130,5);
    this.doorG.lineStyle(3,safe?0x64edb5:0xfd687d,1).strokeRoundedRect(x-47,327,94,130,5);
    this.doorG.lineStyle(1,safe?0x64edb5:0x692e40,.65).lineBetween(x,327,x,457);
    this.doorG.fillStyle(safe?0x64edb5:0xfd687d,1).fillCircle(x+32,395,5);
    this.add.text(x,317,safe?'OPEN':'LOCKED',{fontSize:'12px',fontFamily:'monospace',color:safe?'#64edb5':'#fd687d'}).setOrigin(.5).setName('door-label');
    const labels=this.children.list.filter(v=>v.name==='door-label'); for(const old of labels.slice(0,-1))old.destroy();
  }
  update(time,delta){
    if(!this.actor?.active)return;
    this.frameNo+=delta;
    const left=this.keys && (this.keys.A.isDown||this.keys.LEFT.isDown) || this.virtual.left;
    const right=this.keys && (this.keys.D.isDown||this.keys.RIGHT.isDown) || this.virtual.right;
    const onGround=this.actor.body.blocked.down||this.actor.body.touching.down;
    if(!this.isLocked){
      const sprint=Boolean(this.keys?.SHIFT?.isDown); const vx=(Number(Boolean(right))-Number(Boolean(left)))*(sprint?SPRINT:SPEED);
      this.actor.setVelocityX(vx);
      if(vx!==0)this.actor.setFlipX(vx<0);
      const jump=Boolean(this.keys && (Phaser.Input.Keyboard.JustDown(this.keys.W)||Phaser.Input.Keyboard.JustDown(this.keys.UP)||Phaser.Input.Keyboard.JustDown(this.keys.SPACE))) || (this.virtual.jump&&!this.virtual.wasJump);
      if(jump&&onGround){this.actor.setVelocityY(-JUMP);sound.beep('jump');}
      if(this.keys && Phaser.Input.Keyboard.JustDown(this.keys.E))this.interact();
    } else {this.actor.setVelocityX(0);}
    this.virtual.wasJump=this.virtual.jump;
    const velocity=this.actor.body.velocity;
    this.state=!onGround?(velocity.y<0?'jump':'fall'):Math.abs(velocity.x)>3?'run':'idle';
    this.drawStickman();
    const distance=Math.abs(this.actor.x-750);
    const nearTerminal=distance<105;
    const nearDoor=Math.abs(this.actor.x-STICK)<85;
    const show=nearTerminal||nearDoor;
    this.prompt.setVisible(show&&!this.isLocked);
    if(show){const str=nearTerminal?'[E] OPEN CODING TERMINAL':this.floorSolved?'[E] ENTER ELEVATOR':'ELEVATOR LOCKED';this.prompt.setText(str);this.prompt.setPosition((nearTerminal?750:STICK)-105,283);}
    if(this.lastNear!==`${nearTerminal}:${nearDoor}`){this.lastNear=`${nearTerminal}:${nearDoor}`;emit('game:near',{terminal:nearTerminal,door:nearDoor});}
  }
  drawStickman(){
    const x=this.actor.x; const y=this.actor.y; const g=this.avatar;g.clear();
    const moving=this.state==='run';const phase=moving?Math.sin(this.frameNo/87):0;
    const bob=moving?Math.abs(phase)*2:0;
    const facing=this.actor.flipX?-1:1;
    const baseY=y+19-bob;
    const torsoTop=baseY-30;const headY=torsoTop-15;
    g.lineStyle(3.5,0xe7fbff,1); g.strokeCircle(x,headY,10.2);
    g.lineBetween(x,torsoTop-4,x,baseY);
    const armMove=moving?phase*11:2;
    g.lineBetween(x,torsoTop+2,x-13*facing,torsoTop+16+armMove);
    g.lineBetween(x,torsoTop+2,x+13*facing,torsoTop+16-armMove);
    const legMove=moving?phase*13:0;
    g.lineBetween(x,baseY,x-11,baseY+17+legMove);
    g.lineBetween(x,baseY,x+11,baseY+17-legMove);
    if(this.state==='jump'||this.state==='fall'){
      g.lineBetween(x,baseY,x-15,baseY+8);g.lineBetween(x,baseY,x+14,baseY+8);
    }
    g.fillStyle(0x6ef3c8,.8);g.fillCircle(x+3*facing,headY-1,1.2);
  }
  interact(){
    if(this.isLocked||!this.actor)return;
    if(Math.abs(this.actor.x-750)<115){emit('ui:challenge',{floor:this.floor});sound.beep();return;}
    if(Math.abs(this.actor.x-STICK)<97){
      if(this.floorSolved)emit('ui:elevator',{floor:this.floor});
      else emit('ui:locked',{floor:this.floor});
    }
  }
}
export const GAME_CONFIG = {
  type: Phaser.AUTO, parent:'game', width:960,height:540,
  backgroundColor:'#080e1c', pixelArt:false, antialias:true,
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  physics:{default:'arcade',arcade:{gravity:{y:1030},debug:false}},
  render:{powerPreference:'low-power'}, scene:[GameScene]
};

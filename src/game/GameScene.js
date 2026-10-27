import Phaser from 'phaser';
import { bus, emit } from '../core/bus.js';
import { getFloor } from '../content/floors.js';
import { CHAPTERS } from '../content/extended.js';
import { sound } from '../core/sound.js';
import { loadProgress } from '../state/progress.js';
import { canUseGameKeyboard, shouldPreventGameScroll } from './keyboardFocus.js';
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
    this.state = 'idle'; this.frameNo = 0; this.doorOpen = 0; this.transitioning = false; this.facing = 1;
    this.wasGrounded = false;this.landPulse=0;this.boardingStage='';
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
    // Do not register Phaser's global preventDefault capture for navigation keys.
    // Capturing Space/Arrows globally makes them unusable inside the code editor.
    this.keys = this.input.keyboard?.addKeys('A,D,W,LEFT,RIGHT,UP,SPACE,E,SHIFT,ESC', false);
    this.onGameKeyDown = (event) => {
      if (shouldPreventGameScroll(event, { modalOpen: this.isLocked, body: document.body })) event.preventDefault();
    };
    document.addEventListener('keydown', this.onGameKeyDown, { passive: false });
    this.listeners = [
      ['game:floor',(event)=>{this.registry.set('floor',event.detail.floor);this.registry.set('solved',Boolean(event.detail.solved));this.scene.restart();}],
      ['game:solved',()=>{this.registry.set('solved',true);this.floorSolved=true;this.openDoor();}],
      ['game:elevator:begin',()=>this.boardElevator()],
      ['game:lock',(event)=>{this.isLocked=Boolean(event.detail.locked);if(this.isLocked) this.actor.setVelocityX(0);}],
      ['game:control',(event)=>{const {name,pressed}=event.detail;if(name==='interact' && pressed) this.interact();else if(name in this.virtual)this.virtual[name]=pressed;}],
    ];
    for (const [name,fn] of this.listeners) bus.addEventListener(name,fn);
    this.events.once('shutdown',()=>{
      for (const [name,fn] of this.listeners) bus.removeEventListener(name,fn);
      document.removeEventListener('keydown', this.onGameKeyDown);
    });
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
    this.add.text(44,48,`SECTOR ${String(this.room.chapter).padStart(2,'0')} / ${CHAPTERS[this.room.chapter-1].title.toUpperCase()}`,{fontFamily:'monospace',fontSize:'14px',color:'#587f9a',letterSpacing:3});
    this.add.text(46,70,'FLOOR '+String(this.floor).padStart(2,'0')+' : '+this.room.title.toUpperCase(),{fontFamily:'monospace',fontSize:'18px',color:'#dcecff',letterSpacing:2});
    if(this.floor===10) this.add.text(720,112,'⚠ CORE INSTABILITY DETECTED',{fontFamily:'monospace',fontSize:'13px',color:'#ff7c85'});
    this.add.rectangle(W/2,490,W,20,0x172f40,.96).setDepth(1);
    const stripe=this.add.graphics().setDepth(2);stripe.lineStyle(2,0x2f5770,.8);stripe.lineBetween(0,455,W,455);
    for(let x=0;x<W;x+=45)stripe.lineBetween(x,478,x+21,478);
    this.add.text(90,295,String(this.floor).padStart(2,'0'),{fontFamily:'monospace',fontSize:'56px',color:'#172e46'}).setRotation(-.14);
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
    this.doorG=this.add.graphics().setDepth(5);
    this.doorLabel=this.add.text(STICK,317,'LOCKED',{fontSize:'12px',fontFamily:'monospace',color:'#fd687d'}).setOrigin(.5).setDepth(6);
    this.add.text(STICK,305,'ASCENT LIFT',{fontFamily:'monospace',fontSize:'13px',color:'#becddd'}).setOrigin(.5);
    this.doorOpen=this.floorSolved?1:0;
    this.redrawDoor();
  }
  redrawDoor(){
    if(!this.doorG)return;
    const x=STICK,g=this.doorG,open=this.doorOpen;
    const safe=this.floorSolved;
    g.clear();
    g.fillStyle(0x030a16,1).fillRoundedRect(x-49,326,98,132,6);
    // Neon door frame. Two distinct leaves physically slide apart.
    g.lineStyle(3,safe?0x64edb5:0xfd687d).strokeRoundedRect(x-49,326,98,132,6);
    g.fillStyle(0x0d2130,1).fillRect(x-44,330,88,123);
    if(open>.03){
      g.fillStyle(0x1d655d,.24*open).fillRect(x-43,332,86,117);
      g.lineStyle(1,0x7cffe6,.45*open);for(let i=0;i<4;i++)g.lineBetween(x-31,339+i*24,x+31,339+i*24);
    }
    const half=43*(1-open),offset=42*open;
    g.fillStyle(0x263e54,1).fillRect(x-43-offset,332,half,118);
    g.fillStyle(0x263e54,1).fillRect(x+offset,332,half,118);
    g.lineStyle(2,safe?0x77ffd6:0xfd7184,.7);
    g.lineBetween(x-offset,332,x-offset,450);
    g.lineBetween(x+offset,332,x+offset,450);
    g.fillStyle(safe?0x64edb5:0xfd687d,1).fillCircle(x+37,391,4);
    if(this.doorLabel){this.doorLabel.setText(safe?(this.boardingStage==='closing'?'CLOSING':this.boardingStage==='ascending'?'CLOSED':open>.96?'OPEN':'OPENING'):'LOCKED').setColor(safe?'#64edb5':'#fd687d');}
  }
  openDoor(){
    if(this.floorSolved && this.doorOpen<1){
      this.tweens.add({targets:this,duration:600,doorOpen:1,ease:'Cubic.easeOut',onUpdate:()=>this.redrawDoor()});
      sound.beep('ok');
    }
  }
  setBoardingStage(stage){
    this.boardingStage=stage;
    emit('game:elevator:stage',{stage,floor:this.floor});
  }
  boardElevator(){
    if(this.transitioning||!this.floorSolved||!this.actor?.active)return;
    this.transitioning=true;this.isLocked=true;this.setBoardingStage('opening');
    this.actor.setVelocity(0,0);this.actor.body.enable=false;
    const walkTo=()=>{
      if(!this.actor?.active)return;
      this.setBoardingStage('approaching');this.facing=1;this.state='run';
      this.tweens.add({targets:this.actor,x:STICK,duration:Math.min(1700,Math.max(420,Math.abs(STICK-this.actor.x)*2)),ease:'Sine.easeInOut',onComplete:()=>{
        this.setBoardingStage('entering');this.state='enter';this.frameNo=0;
        // Stickman is visibly inside the frame, then disappears behind the closing panels.
        this.avatar.setDepth(4);
        this.tweens.add({targets:this.actor,scaleX:.52,scaleY:.77,y:this.actor.y-9,duration:430,ease:'Quad.easeIn',onComplete:()=>{
          this.setBoardingStage('closing');
          this.tweens.add({targets:this,doorOpen:0,duration:480,ease:'Cubic.easeInOut',onUpdate:()=>this.redrawDoor(),onComplete:()=>{
            this.avatar.setAlpha(0);
            this.setBoardingStage('ascending');
            this.cameras.main.fadeOut(480,2,10,21);
            let arrived=false;
            const complete=()=>{if(arrived)return;arrived=true;emit('game:elevator:arrived',{floor:this.floor});};
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,complete);
            this.time.delayedCall(800,complete);
          }});
        }});
      }});
    };
    if(this.doorOpen<.99){this.openDoor();this.time.delayedCall(670,walkTo);}else walkTo();
  }
  update(time,delta){
    if(!this.actor?.active)return;
    this.frameNo+=delta;this.landPulse=Math.max(0,this.landPulse-delta/220);
    const gameKeyboard = canUseGameKeyboard({ modalOpen: this.isLocked, activeElement: document.activeElement });
    const left=(gameKeyboard && this.keys && (this.keys.A.isDown||this.keys.LEFT.isDown)) || this.virtual.left;
    const right=(gameKeyboard && this.keys && (this.keys.D.isDown||this.keys.RIGHT.isDown)) || this.virtual.right;
    const onGround=this.actor.body.blocked.down||this.actor.body.touching.down;
    if(onGround&&!this.wasGrounded&&this.frameNo>300&&!this.transitioning){this.landPulse=1;sound.beep('land');}
    this.wasGrounded=onGround;
    if(!this.isLocked){
      const sprint=Boolean(gameKeyboard && this.keys?.SHIFT?.isDown); const vx=(Number(Boolean(right))-Number(Boolean(left)))*(sprint?SPRINT:SPEED);
      this.actor.setVelocityX(vx);if(vx!==0)this.facing=Math.sign(vx);
      if(vx!==0)this.actor.setFlipX(vx<0);
      const jump=Boolean(gameKeyboard && this.keys && (Phaser.Input.Keyboard.JustDown(this.keys.W)||Phaser.Input.Keyboard.JustDown(this.keys.UP)||Phaser.Input.Keyboard.JustDown(this.keys.SPACE))) || (this.virtual.jump&&!this.virtual.wasJump);
      if(jump&&onGround){this.actor.setVelocityY(-JUMP);sound.beep('jump');}
      if(gameKeyboard && this.keys && Phaser.Input.Keyboard.JustDown(this.keys.E))this.interact();
    } else {this.actor.setVelocityX(0);}
    this.virtual.wasJump=this.virtual.jump;
    const velocity=this.actor.body.velocity;
    if(!this.transitioning)this.state=!onGround?(velocity.y<0?'jump':'fall'):Math.abs(velocity.x)>3?'run':'idle';
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
    const g=this.avatar;g.clear();
    if(!this.actor?.active)return;
    const x=this.actor.x,y=this.actor.y;
    const running=this.state==='run';
    const angle=this.frameNo/(running?105:520);
    const step=running?Math.sin(angle):0;
    const kick=running?Math.cos(angle):0;
    const flight=this.state==='jump'||this.state==='fall';
    const facing=this.facing||1;
    const lean=running?facing*3:flight?facing*2:Math.sin(angle)*.7;
    const bob=running?Math.abs(kick)*2:Math.sin(angle)*1.5;
    const shoulder={x:x+lean*.7,y:y-15-bob+this.landPulse*3};
    const hip={x:x-lean*.25,y:y+13-bob};
    const head={x:x+lean,y:y-37-bob+this.landPulse*4};
    const skin=0xf1faff,accent=0x78ffe2;
    g.lineStyle(3.8,skin,.98);
    const headRadius=11.6+(this.state==='jump' ? .9 : 0)-this.landPulse*.8;
    g.strokeCircle(head.x,head.y,headRadius);
    g.lineBetween(shoulder.x,shoulder.y-5,hip.x,hip.y);
    const line=(a,b,c,d,w=3.6)=>{g.lineStyle(w,skin,1).lineBetween(a,b,c,d);};
    const arm=running?step*11:flight?(this.state==='jump'?-10:12):this.state==='enter'?4:Math.sin(angle)*2;
    const lHand={x:shoulder.x-16-facing*(running?3:0),y:shoulder.y+20+arm};
    const rHand={x:shoulder.x+16+facing*(running?3:0),y:shoulder.y+20-arm};
    line(shoulder.x,shoulder.y,shoulder.x-9,shoulder.y+9+arm*.4);
    line(shoulder.x-9,shoulder.y+9+arm*.4,lHand.x,lHand.y,3.4);
    line(shoulder.x,shoulder.y,shoulder.x+9,shoulder.y+9-arm*.4);
    line(shoulder.x+9,shoulder.y+9-arm*.4,rHand.x,rHand.y,3.4);
    const swing=flight?(this.state==='jump'?5:-4):this.state==='enter'?2:step*12;
    const lKnee={x:hip.x-9-swing*.5,y:hip.y+12+(flight?-2:Math.abs(kick)*2)};
    const rKnee={x:hip.x+9+swing*.5,y:hip.y+12+(flight?-2:Math.abs(kick)*2)};
    const lFoot={x:lKnee.x-6-swing,y:hip.y+(flight?23:29)-swing*.3};
    const rFoot={x:rKnee.x+6+swing,y:hip.y+(flight?23:29)+swing*.3};
    line(hip.x,hip.y,lKnee.x,lKnee.y);line(lKnee.x,lKnee.y,lFoot.x,lFoot.y);
    line(hip.x,hip.y,rKnee.x,rKnee.y);line(rKnee.x,rKnee.y,rFoot.x,rFoot.y);
    g.lineStyle(2,accent,.85).lineBetween(lFoot.x-4,lFoot.y,lFoot.x+4,lFoot.y);
    g.lineBetween(rFoot.x-4,rFoot.y,rFoot.x+4,rFoot.y);
    g.fillStyle(accent,1).fillCircle(head.x+4*facing,head.y-1,1.5);
    // Second eye and brows give expression without deviating from minimalist stickman design.
    g.fillCircle(head.x+8*facing,head.y-1,1);
    if(this.state==='fall')g.lineStyle(1.4,accent,.5).lineBetween(x-21,y-30,x-21,y-12);
    // Contact shadow and small landing pulse make grounded movement readable.
    g.lineStyle(1,accent,Math.max(.14,.42-this.landPulse*.2)).strokeEllipse(x,y+38,32+this.landPulse*13,4+this.landPulse*2);
  }
  interact(){
    if(this.isLocked||this.transitioning||!this.actor)return;
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

export function startGame(){ return new Phaser.Game(GAME_CONFIG); }

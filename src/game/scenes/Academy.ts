import { Scene } from 'phaser';
import { EventBus, GAME_EVENTS } from '../EventBus';
import { usePlayerStore } from '@/store/usePlayerStore';

export class Academy extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private sifu!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private joystickDir: { x: number; y: number } = { x: 0, y: 0 };
  private isInteracting = false;

  constructor() {
    super('Academy');
  }

  create() {
    const charData = usePlayerStore.getState().character;

    const map = this.make.tilemap({ key: 'map_academy' });
    const tileset = map.addTilesetImage('academy_tileset', 'tiles_academy');

    let wallLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    if (tileset) {
      map.createLayer('Ground', tileset, 0, 0);
      wallLayer = map.createLayer('Walls', tileset, 0, 0);
      wallLayer?.setCollisionByProperty({ collides: true });
    }

    this.player = this.physics.add.sprite(
      charData?.position_x || 400,
      charData?.position_y || 300,
      'player',
    );
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(32, 32);
    this.player.setOffset(16, 32);
    if (wallLayer) this.physics.add.collider(this.player, wallLayer);

    this.sifu = this.physics.add.sprite(500, 250, 'sifu').setImmovable(true);
    this.physics.add.overlap(this.player, this.sifu, () => {
      if (!this.isInteracting) {
        this.isInteracting = true;
        EventBus.emit(GAME_EVENTS.INTERACT_NPC, { name: 'Sifu Li', questId: 'initial_quest' });
      }
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    EventBus.on('input-move', (dir: { x: number; y: number }) => {
      this.joystickDir = dir;
    });
    EventBus.on('dialog-closed', () => {
      this.time.delayedCall(1000, () => {
        this.isInteracting = false;
      });
    });

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.8);

    this.events.once('shutdown', () => {
      EventBus.off('input-move');
      EventBus.off('dialog-closed');
    });

    EventBus.emit(GAME_EVENTS.PHASER_READY, this);
  }

  update() {
    if (!this.player) return;
    const speed = 160;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;
    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    if (vx === 0 && vy === 0) {
      vx = this.joystickDir.x * speed;
      vy = this.joystickDir.y * speed;
    }

    this.player.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      if (this.anims.exists('walk')) this.player.anims.play('walk', true);
      this.player.flipX = vx < 0;
      if (this.time.now % 2000 < 20) {
        EventBus.emit(GAME_EVENTS.PLAYER_MOVED, { x: this.player.x, y: this.player.y });
      }
    } else if (this.anims.exists('walk')) {
      this.player.anims.stop();
    }
  }
}

import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    this.load.setPath('assets');

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.add
      .text(centerX, centerY - 50, 'Carregando Academia...', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#00A86B',
      })
      .setOrigin(0.5);

    this.load.spritesheet('player', 'entities/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('sifu', 'entities/sifu.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('tiles_academy', 'maps/academy_tileset.png');
    this.load.tilemapTiledJSON('map_academy', 'maps/academy_initial.json');

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('Asset missing, generating placeholder:', file.key);
      if (file.type === 'image' || file.type === 'spritesheet') {
        this.createPlaceholder(file.key);
      }
    });
  }

  private createPlaceholder(key: string) {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x00a86b, 1);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0x004d33, 1);
    g.strokeRect(1, 1, 62, 62);
    g.generateTexture(key, 64, 64);
    g.destroy();
  }

  create() {
    const playerTex = this.textures.get('player');
    if (playerTex && playerTex.frameTotal > 4) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    this.scene.start('Academy');
  }
}

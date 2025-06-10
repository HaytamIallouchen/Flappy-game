export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('start', 'assets/start.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('bird', 'assets/bird.png');
        this.load.audio('die', 'assets/die.wav');
        this.load.image('pipe', 'assets/pipe.png');
    }



    create() {
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        this.scoreText.setDepth(10);


        // Achtergrond toevoegen
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background').setOrigin(0);

        // Vogel toevoegen
        this.bird = this.physics.add.sprite(300, 350, 'bird');
        this.bird.setCollideWorldBounds(true);
        this.bird.body.allowGravity = false;

        // Startafbeelding
        this.startImage = this.add.image(this.scale.width / 2, this.scale.height / 2, 'start');
        this.startImage.setDepth(1);

        // Geluid
        this.dieSound = this.sound.add('die');

        // Maak groep voor pijpen
        this.pipes = this.physics.add.group();

        // Voeg timer toe voor het spawnen van pijpen
        this.pipeTimer = this.time.addEvent({
            delay: 1500, // om de 1.5 seconden
            callback: this.spawnPipes,
            callbackScope: this,
            loop: true,
            paused: true // nog niet actief
        });


        // Game start nog niet
        this.gameStarted = false;

        // Eerste tik: begin het spel
        this.input.on('pointerdown', () => {
            if (!this.gameStarted) {
                this.startImage.destroy();
                this.bird.body.allowGravity = true;
                this.gameStarted = true;
            }
            this.bird.setVelocityY(-350); // Elke tik laat de vogel flappen!
        });

    }


    flap() {
        this.bird.setVelocityY(-350);
        // Voeg geluid toe als je wilt
    }

    spawnPipes() {
        const gap = 150; // De ruimte waar de vogel doorheen vliegt
        const minY = 100;
        const maxY = this.scale.height - gap - 100;
        const pipeY = Phaser.Math.Between(minY, maxY);

        // Bovenste pijp (omgedraaid)
        const topPipe = this.pipes.create(this.scale.width, pipeY - gap / 2, 'pipe');
        topPipe.setOrigin(0, 1); // Vastmaken aan onderkant van sprite
        topPipe.setFlipY(true);  // Draai hem 180 graden
        topPipe.body.velocity.x = -200; // Beweeg naar links
        topPipe.body.immovable = true;

        // Onderste pijp
        const bottomPipe = this.pipes.create(this.scale.width, pipeY + gap / 2, 'pipe');
        bottomPipe.setOrigin(0, 0); // Vastmaken aan bovenkant
        bottomPipe.body.velocity.x = -200;
        bottomPipe.body.immovable = true;

        const scoreZone = this.add.zone(this.scale.width + 25, this.scale.height / 2)
            .setSize(1, this.scale.height)
            .setOrigin(0, 0.5);

        this.physics.add.existing(scoreZone);
        scoreZone.body.setAllowGravity(false);
        scoreZone.body.setVelocityX(-200);
        scoreZone.passed = false;

        this.physics.add.overlap(this.bird, scoreZone, () => {
            if (!scoreZone.passed) {
                scoreZone.passed = true;
                this.score += 1;
                this.scoreText.setText('Score: ' + this.score);
            }
        });


        // Verwijder oude pijpen die uit beeld zijn
        this.pipes.children.each(pipe => {
            if (pipe.x + pipe.width < 0) {
                pipe.destroy();
            }
        });

        topPipe.body.allowGravity = false;
        bottomPipe.body.allowGravity = false;
    }


    update() {
        // Eenvoudige check of vogel de onderkant raakt
        if (this.bird.y > 500) {
            this.dieSound.play();
            this.scene.restart();
        }

        // botsingen
        if (this.gameStarted) {
            this.pipeTimer.paused = false;

            this.physics.world.collide(this.bird, this.pipes, () => {
                this.dieSound.play();
                this.scene.restart();
            });
        }

    }
}

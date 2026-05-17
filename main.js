class WarGame extends Phaser.Scene {
  constructor() {
    super("WarGame");

    this.worldWidth = 3600;
    this.groundY = 520;

    this.gameStarted = false;
    this.gameOver = false;
    this.gameWon = false;
    this.transitionActive = false;

    this.currentLevel = 1;
    this.maxLevel = 15;
    this.score = 0;
    this.elapsedTime = 0;

    this.scoreboardRecords = [];
    this.scoreSaved = false;

    this.playerHealth = 100;
    this.playerMaxHealth = 100;
    this.playerInvincibleUntil = 0;

    this.jetpackFuel = 100;
    this.maxJetpackFuel = 100;

    this.playerFacing = 1;
    this.gunVisible = false;
    this.jetpackVisible = false;
    this.backpackOpen = false;

    this.backpack = {
      laser: 0,
      bazooka: 0,
      medkit: 0
    };

    this.shootCooldown = 0;
    this.grenadeCooldown = 0;
    this.laserCooldown = 0;
    this.rocketCooldown = 0;

    this.audioContext = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.ambienceNodes = [];
    this.soundReady = false;

    this.menuObjects = [];
  }

  preload() {}

  create() {
    this.createTextures();
    this.createBackground();
    this.createControls();
    this.loadScoreboard();
    this.createMainMenu();
  }

  update(time, delta) {
    if (!this.gameStarted || this.gameOver || this.gameWon) return;

    const deltaSeconds = delta / 1000;
    this.elapsedTime += deltaSeconds;

    this.handlePlayerMovement(deltaSeconds);
    this.handleToggles();
    this.handleHealing();
    this.updatePlayerGear();
    this.updateUI();

    if (this.transitionActive) return;

    this.handleShooting(time);
    this.handleGrenade(time);
    this.handleLaser(time);
    this.handleBazooka(time);
    this.updateEnemies(time);
    this.updateEnemyHealthBars();
    this.checkLevelComplete();
  }

  createTextures() {
    const g = this.add.graphics();

    g.clear();
    g.fillStyle(0x2563eb, 1);
    g.fillRoundedRect(14, 18, 24, 42, 8);
    g.fillStyle(0x0f172a, 1);
    g.fillCircle(26, 10, 11);
    g.fillStyle(0x00ffcc, 1);
    g.fillRoundedRect(18, 7, 16, 5, 2);
    g.fillStyle(0x1d4ed8, 1);
    g.fillRoundedRect(7, 26, 9, 28, 4);
    g.fillRoundedRect(36, 26, 9, 28, 4);
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(12, 58, 10, 18, 3);
    g.fillRoundedRect(30, 58, 10, 18, 3);
    g.generateTexture("player", 52, 80);

    g.clear();
    g.fillStyle(0x2563eb, 1);
    g.fillRoundedRect(10, 22, 32, 26, 8);
    g.fillStyle(0x0f172a, 1);
    g.fillCircle(26, 14, 11);
    g.fillStyle(0x00ffcc, 1);
    g.fillRoundedRect(18, 11, 16, 5, 2);
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(10, 46, 14, 10, 3);
    g.fillRoundedRect(28, 46, 14, 10, 3);
    g.generateTexture("player_crouch", 52, 58);

    g.clear();
    g.fillStyle(0x8b949e, 1);
    g.fillRoundedRect(8, 20, 44, 48, 6);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(22, 36, 4);
    g.fillCircle(38, 36, 4);
    g.fillStyle(0x00ffcc, 1);
    g.fillRoundedRect(18, 52, 24, 6, 2);
    g.fillStyle(0x343a40, 1);
    g.fillRect(12, 68, 12, 14);
    g.fillRect(36, 68, 12, 14);
    g.generateTexture("robot", 60, 86);

    g.clear();
    g.fillStyle(0x9ca3af, 1);
    g.fillEllipse(32, 26, 42, 24);
    g.fillStyle(0x38bdf8, 1);
    g.fillTriangle(12, 24, 0, 8, 4, 38);
    g.fillTriangle(52, 24, 64, 8, 60, 38);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(24, 24, 3);
    g.fillCircle(40, 24, 3);
    g.generateTexture("flying_robot", 64, 48);

    g.clear();
    g.fillStyle(0x64748b, 1);
    g.fillRoundedRect(15, 15, 70, 90, 8);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(38, 42, 6);
    g.fillCircle(62, 42, 6);
    g.fillStyle(0x111827, 1);
    g.fillRect(5, 48, 12, 42);
    g.fillRect(83, 48, 12, 42);
    g.fillRect(25, 105, 18, 24);
    g.fillRect(57, 105, 18, 24);
    g.fillStyle(0x00ffcc, 1);
    g.fillRect(30, 70, 40, 8);
    g.generateTexture("boss", 100, 135);

    g.clear();
    g.fillStyle(0x3b0764, 1);
    g.fillRoundedRect(10, 10, 90, 105, 10);
    g.fillStyle(0xff003c, 1);
    g.fillCircle(38, 42, 7);
    g.fillCircle(72, 42, 7);
    g.fillStyle(0x14b8a6, 1);
    g.fillTriangle(10, 55, -20, 20, -10, 100);
    g.fillTriangle(100, 55, 130, 20, 120, 100);
    g.fillStyle(0x00ffcc, 1);
    g.fillRect(30, 80, 50, 10);
    g.generateTexture("final_boss", 120, 140);

    g.clear();
    g.fillStyle(0xfacc15, 1);
    g.fillRoundedRect(0, 0, 18, 6, 3);
    g.generateTexture("bullet", 18, 6);

    g.clear();
    g.fillStyle(0xef4444, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture("enemy_bullet", 12, 12);

    g.clear();
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 3, 4, 14);
    g.fillRect(3, 8, 14, 4);
    g.generateTexture("medkit", 20, 20);

    g.clear();
    g.fillStyle(0x06b6d4, 1);
    g.fillRoundedRect(0, 6, 36, 8, 4);
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 8, 16, 4);
    g.generateTexture("laser", 36, 20);

    g.clear();
    g.fillStyle(0xf97316, 1);
    g.fillRoundedRect(0, 4, 42, 12, 6);
    g.fillStyle(0x111827, 1);
    g.fillRect(28, 1, 8, 18);
    g.generateTexture("bazooka", 42, 22);

    g.clear();
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0x111827, 1);
    g.fillRect(8, 0, 4, 8);
    g.generateTexture("grenade", 20, 20);

    g.clear();
    g.fillStyle(0xf97316, 1);
    g.fillCircle(18, 18, 18);
    g.fillStyle(0xfacc15, 1);
    g.fillCircle(18, 18, 10);
    g.generateTexture("explosion", 36, 36);

    g.destroy();
  }

  createBackground() {
    this.physics.world.setBounds(0, 0, this.worldWidth, 600);
    this.add.rectangle(this.worldWidth / 2, 300, this.worldWidth, 600, 0x0f172a).setDepth(-20);

    for (let i = 0; i < 12; i++) {
      this.createCloud(120 + i * 300, 80 + Phaser.Math.Between(0, 70));
    }

    for (let x = 0; x < this.worldWidth; x += 120) {
      const h = Phaser.Math.Between(160, 330);
      const w = Phaser.Math.Between(70, 110);
      const color = Phaser.Math.RND.pick([0x111827, 0x1e293b, 0x0f172a]);
      this.createBuilding(x + 55, this.groundY - h / 2, w, h, color);
    }

    this.add.rectangle(this.worldWidth / 2, 555, this.worldWidth, 90, 0x111827).setDepth(-5);
    this.add.rectangle(this.worldWidth / 2, 515, this.worldWidth, 5, 0x00ffcc).setDepth(-4);

    for (let x = 40; x < this.worldWidth; x += 120) {
      this.add.rectangle(x, 560, 60, 5, 0xe5e7eb, 0.45).setDepth(-3);
    }

    this.ground = this.add.rectangle(this.worldWidth / 2, this.groundY + 50, this.worldWidth, 80, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
  }

  createCloud(x, y) {
    const cloud = this.add.graphics();
    cloud.setDepth(-18);
    cloud.fillStyle(0x334155, 0.55);
    cloud.fillCircle(x, y, 28);
    cloud.fillCircle(x + 32, y - 10, 36);
    cloud.fillCircle(x + 70, y, 28);
    cloud.fillRoundedRect(x - 8, y, 100, 22, 12);
  }

  createBuilding(x, y, width, height, color) {
    this.add.rectangle(x, y, width, height, color).setDepth(-15);

    for (let wx = x - width / 2 + 15; wx < x + width / 2 - 10; wx += 22) {
      for (let wy = y - height / 2 + 20; wy < y + height / 2 - 20; wy += 32) {
        const lit = Phaser.Math.Between(0, 1) === 1;
        this.add.rectangle(wx, wy, 8, 14, lit ? 0x38bdf8 : 0x020617, lit ? 0.5 : 0.8).setDepth(-14);
      }
    }
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.keys = this.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      J: Phaser.Input.Keyboard.KeyCodes.J,
      K: Phaser.Input.Keyboard.KeyCodes.K,
      H: Phaser.Input.Keyboard.KeyCodes.H,
      L: Phaser.Input.Keyboard.KeyCodes.L,
      U: Phaser.Input.Keyboard.KeyCodes.U,
      B: Phaser.Input.Keyboard.KeyCodes.B,
      ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
      TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
  }

  createMainMenu() {
    this.clearMenu();
    this.cameras.main.stopFollow();
    this.cameras.main.scrollX = 0;

    const overlay = this.add.rectangle(450, 300, 900, 600, 0x000000, 0.65).setScrollFactor(0).setDepth(50);

    const title = this.add.text(450, 125, "WAR HUMAN VS ROBOTS", {
      fontSize: "38px",
      color: "#00ffcc",
      fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    const startBtn = this.makeButton(450, 235, "START GAME", () => this.startGame());
    const controlsBtn = this.makeButton(450, 315, "CONTROLS", () => this.showControlsMenu());
    const scoreboardBtn = this.makeButton(450, 395, "SCOREBOARD", () => this.showScoreboardMenu());

    this.menuObjects.push(overlay, title, startBtn, controlsBtn, scoreboardBtn);
  }

  showControlsMenu() {
    this.clearMenu();

    const overlay = this.add.rectangle(450, 300, 900, 600, 0x000000, 0.75).setScrollFactor(0).setDepth(50);

    const controls = this.add.text(
      450,
      260,
      "CONTROLS\n\n" +
      "A / Left Arrow = Move Left\n" +
      "D / Right Arrow = Move Right\n" +
      "W / Up Arrow = Jump\n" +
      "S / Down Arrow = Crouch\n" +
      "U = Show / Hide Gun\n" +
      "J = Shoot\n" +
      "Arrow Keys + J = Directional Shooting\n" +
      "K = Throw Grenade\n" +
      "L = Show / Hide Jetpack\n" +
      "Space = Fly With Jetpack\n" +
      "B = Backpack\n" +
      "1 = Use Laser\n" +
      "2 = Use Bazooka\n" +
      "H = Use Medkit",
      {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 5
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    const backBtn = this.makeButton(450, 535, "BACK TO MENU", () => this.createMainMenu());
    this.menuObjects.push(overlay, controls, backBtn);
  }

  showScoreboardMenu() {
    this.clearMenu();
    this.loadScoreboard();

    const overlay = this.add.rectangle(450, 300, 900, 600, 0x000000, 0.75).setScrollFactor(0).setDepth(50);

    const title = this.add.text(450, 70, "SCOREBOARD", {
      fontSize: "38px",
      color: "#00ffcc",
      fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.menuObjects.push(overlay, title);

    if (this.scoreboardRecords.length === 0) {
      const empty = this.add.text(450, 260, "No scores saved yet.\nPlay the game first!", {
        fontSize: "26px",
        color: "#ffffff",
        align: "center"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

      this.menuObjects.push(empty);
    } else {
      const rankHead = this.add.text(155, 125, "RANK", { fontSize: "20px", color: "#38bdf8", fontStyle: "bold" }).setScrollFactor(0).setDepth(51);
      const scoreHead = this.add.text(285, 125, "SCORE", { fontSize: "20px", color: "#38bdf8", fontStyle: "bold" }).setScrollFactor(0).setDepth(51);
      const levelHead = this.add.text(445, 125, "LEVEL", { fontSize: "20px", color: "#38bdf8", fontStyle: "bold" }).setScrollFactor(0).setDepth(51);
      const timeHead = this.add.text(600, 125, "TIME", { fontSize: "20px", color: "#38bdf8", fontStyle: "bold" }).setScrollFactor(0).setDepth(51);

      this.menuObjects.push(rankHead, scoreHead, levelHead, timeHead);

      for (let i = 0; i < this.scoreboardRecords.length; i++) {
        const r = this.scoreboardRecords[i];
        const rowY = 165 + i * 34;
        const rowColor = i === 0 ? "#00ffcc" : "#ffffff";

        const rankText = this.add.text(165, rowY, `${i + 1}`, { fontSize: "19px", color: rowColor }).setScrollFactor(0).setDepth(51);
        const scoreText = this.add.text(295, rowY, `${r.score}`, { fontSize: "19px", color: rowColor }).setScrollFactor(0).setDepth(51);
        const levelText = this.add.text(460, rowY, `${r.level}`, { fontSize: "19px", color: rowColor }).setScrollFactor(0).setDepth(51);
        const timeText = this.add.text(600, rowY, `${r.time}`, { fontSize: "19px", color: rowColor }).setScrollFactor(0).setDepth(51);

        this.menuObjects.push(rankText, scoreText, levelText, timeText);
      }
    }

    const backBtn = this.makeButton(450, 535, "BACK TO MENU", () => this.createMainMenu());
    this.menuObjects.push(backBtn);
  }

  makeButton(x, y, text, callback) {
    const btn = this.add.text(x, y, text, {
      fontSize: "26px",
      color: "#111827",
      backgroundColor: "#00ffcc",
      padding: { x: 26, y: 12 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(60).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#38bdf8", color: "#020617" }));
    btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#00ffcc", color: "#111827" }));
    btn.on("pointerdown", callback);

    return btn;
  }

  clearMenu() {
    for (const obj of this.menuObjects) {
      if (obj && obj.destroy) obj.destroy();
    }
    this.menuObjects = [];
  }

  loadScoreboard() {
    try {
      const saved = localStorage.getItem("warHumanVsRobotsScores");
      this.scoreboardRecords = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.scoreboardRecords = [];
    }
  }

  saveScoreboard() {
    try {
      localStorage.setItem("warHumanVsRobotsScores", JSON.stringify(this.scoreboardRecords));
    } catch (e) {
      console.log("Could not save scoreboard.");
    }
  }

  saveScoreRecord() {
    if (this.scoreSaved) return;

    this.scoreSaved = true;

    const record = {
      score: this.score,
      level: this.currentLevel,
      time: this.formatTime(Math.floor(this.elapsedTime))
    };

    this.scoreboardRecords.push(record);
    this.scoreboardRecords.sort((a, b) => b.score - a.score);
    this.scoreboardRecords = this.scoreboardRecords.slice(0, 10);

    this.saveScoreboard();
  }

  startGame() {
    this.clearMenu();

    this.createSoundSystem();
    this.startBackgroundAmbience();

    this.gameStarted = true;
    this.gameOver = false;
    this.gameWon = false;
    this.transitionActive = false;

    this.currentLevel = 1;
    this.score = 0;
    this.elapsedTime = 0;
    this.scoreSaved = false;

    this.playerHealth = this.playerMaxHealth;
    this.jetpackFuel = this.maxJetpackFuel;

    this.gunVisible = false;
    this.jetpackVisible = false;
    this.backpackOpen = false;

    this.backpack = {
      laser: 0,
      bazooka: 0,
      medkit: 0
    };

    this.createGameObjects();
    this.createUI();
    this.startLevel(1);
  }

  createGameObjects() {
    this.bullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.grenades = this.physics.add.group();
    this.rockets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();

    this.player = this.physics.add.sprite(150, this.groundY - 50, "player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(34, 70);
    this.player.body.setOffset(9, 8);
    this.player.setDepth(5);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.collider(this.pickups, this.ground);
    this.physics.add.collider(this.grenades, this.ground);
    this.physics.add.collider(this.rockets, this.ground);

    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitsEnemy, null, this);
    this.physics.add.overlap(this.enemyBullets, this.player, this.enemyBulletHitsPlayer, null, this);
    this.physics.add.overlap(this.rockets, this.enemies, this.rocketHitsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.enemyTouchesPlayer, null, this);
    this.physics.add.overlap(this.player, this.pickups, this.pickupItem, null, this);

    this.playerGear = this.add.graphics();
    this.playerGear.setDepth(6);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 600);

    this.tweens.add({
      targets: this.player,
      scaleY: 1.03,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  createUI() {
    this.add.text(20, 16, "Health", { fontSize: "14px", color: "#ffffff" }).setScrollFactor(0).setDepth(100);
    this.add.rectangle(20, 38, 220, 18, 0x1e293b).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.healthBarFill = this.add.rectangle(20, 38, 220, 18, 0x22c55e).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

    const healthBorder = this.add.graphics();
    healthBorder.lineStyle(2, 0xffffff, 1);
    healthBorder.strokeRect(20, 29, 220, 18);
    healthBorder.setScrollFactor(0);
    healthBorder.setDepth(102);

    this.healthText = this.add.text(250, 29, "100 / 100", { fontSize: "16px", color: "#ffffff" }).setScrollFactor(0).setDepth(100);

    this.add.text(20, 60, "Jetpack Fuel", { fontSize: "14px", color: "#ffffff" }).setScrollFactor(0).setDepth(100);
    this.add.rectangle(20, 82, 220, 16, 0x1e293b).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.fuelBarFill = this.add.rectangle(20, 82, 220, 16, 0x00ccff).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

    const fuelBorder = this.add.graphics();
    fuelBorder.lineStyle(2, 0xffffff, 1);
    fuelBorder.strokeRect(20, 74, 220, 16);
    fuelBorder.setScrollFactor(0);
    fuelBorder.setDepth(102);

    this.fuelText = this.add.text(250, 73, "100 / 100", { fontSize: "14px", color: "#ffffff" }).setScrollFactor(0).setDepth(100);

    this.gunText = this.add.text(20, 108, "Gun: HIDDEN", { fontSize: "17px", color: "#ff6666" }).setScrollFactor(0).setDepth(100);
    this.jetpackText = this.add.text(20, 134, "Jetpack: HIDDEN", { fontSize: "17px", color: "#ff6666" }).setScrollFactor(0).setDepth(100);

    this.scoreText = this.add.text(650, 18, "Score: 0", { fontSize: "18px", color: "#ffffff" }).setScrollFactor(0).setDepth(100);
    this.levelText = this.add.text(650, 44, "Level: 1 / 15", { fontSize: "18px", color: "#00ffcc" }).setScrollFactor(0).setDepth(100);
    this.timerText = this.add.text(650, 70, "Time: 00:00", { fontSize: "18px", color: "#ffffff" }).setScrollFactor(0).setDepth(100);

    this.statusText = this.add.text(450, 110, "", { fontSize: "18px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.bossText = this.add.text(450, 140, "", { fontSize: "24px", color: "#ef4444", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.backpackPanel = this.add.text(650, 115, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#020617",
      padding: { x: 14, y: 12 }
    }).setScrollFactor(0).setDepth(120).setVisible(false);
  }

  updateUI() {
    this.levelText.setText("Level: " + this.currentLevel + " / " + this.maxLevel);
    this.scoreText.setText("Score: " + this.score);
    this.timerText.setText("Time: " + this.formatTime(Math.floor(this.elapsedTime)));

    const hpPercent = Phaser.Math.Clamp(this.playerHealth / this.playerMaxHealth, 0, 1);
    this.healthBarFill.displayWidth = 220 * hpPercent;
    this.healthText.setText(Math.floor(this.playerHealth) + " / " + this.playerMaxHealth);

    if (hpPercent > 0.6) this.healthBarFill.fillColor = 0x22c55e;
    else if (hpPercent > 0.3) this.healthBarFill.fillColor = 0xfacc15;
    else this.healthBarFill.fillColor = 0xef4444;

    const fuelPercent = Phaser.Math.Clamp(this.jetpackFuel / this.maxJetpackFuel, 0, 1);
    this.fuelBarFill.displayWidth = 220 * fuelPercent;
    this.fuelText.setText(Math.floor(this.jetpackFuel) + " / " + this.maxJetpackFuel);

    if (fuelPercent > 0.5) this.fuelBarFill.fillColor = 0x00ccff;
    else if (fuelPercent > 0.2) this.fuelBarFill.fillColor = 0xfacc15;
    else this.fuelBarFill.fillColor = 0xef4444;

    this.gunText.setText(this.gunVisible ? "Gun: VISIBLE" : "Gun: HIDDEN");
    this.gunText.setColor(this.gunVisible ? "#00ffcc" : "#ff6666");

    this.jetpackText.setText(this.jetpackVisible ? "Jetpack: VISIBLE" : "Jetpack: HIDDEN");
    this.jetpackText.setColor(this.jetpackVisible ? "#00ffcc" : "#ff6666");

    this.backpackPanel.setVisible(this.backpackOpen);
    this.backpackPanel.setText(
      "BACKPACK\n\n" +
      "Laser: " + this.backpack.laser + "\n" +
      "Bazooka: " + this.backpack.bazooka + "\n" +
      "Medkit: " + this.backpack.medkit
    );
  }

  startLevel(levelNumber) {
    this.currentLevel = levelNumber;
    this.transitionActive = false;
    this.clearLevelObjects();

    this.bossText.setText("");
    this.statusText.setText("");

    this.spawnPickupsForLevel(levelNumber);

    if (levelNumber === 5 || levelNumber === 10 || levelNumber === 15) {
      this.spawnBossLevel(levelNumber);
    } else {
      this.spawnNormalLevel(levelNumber);
    }

    this.updateUI();
  }

  spawnNormalLevel(levelNumber) {
    let groundCount;

    if (levelNumber <= 4) groundCount = Phaser.Math.Clamp(levelNumber + 1, 2, 4);
    else groundCount = 4;

    this.statusText.setText("Level " + levelNumber + ": Destroy all robots");

    const startX = Math.min(this.player.x + 520, this.worldWidth - 800);

    for (let i = 0; i < groundCount; i++) {
      this.createGroundRobot(startX + i * 130, this.groundY - 45, levelNumber);
    }

    if (levelNumber >= 11 && levelNumber <= 14) {
      const flyingCount = levelNumber - 10;
      for (let i = 0; i < flyingCount; i++) {
        this.createFlyingRobot(startX + 120 + i * 170, 230 + i * 35, levelNumber);
      }
    }
  }

  spawnBossLevel(levelNumber) {
    const bossX = Math.min(this.player.x + 650, this.worldWidth - 300);

    if (levelNumber === 5) {
      this.bossText.setText("LEVEL 5 BOSS");
      this.statusText.setText("Defeat the Ground Boss");
      this.createBoss(bossX, this.groundY - 70, levelNumber, false);
    }

    if (levelNumber === 10) {
      this.bossText.setText("LEVEL 10 BOSS");
      this.statusText.setText("Defeat the Heavy Boss");
      this.createBoss(bossX, this.groundY - 70, levelNumber, false);
    }

    if (levelNumber === 15) {
      this.bossText.setText("FINAL BOSS");
      this.statusText.setText("Final Boss heals every 5 seconds");
      this.createBoss(bossX, this.groundY - 70, levelNumber, true);
    }
  }

  createGroundRobot(x, y, levelNumber) {
    const robot = this.enemies.create(x, y, "robot");
    robot.setDepth(4);
    robot.body.setSize(42, 78);
    robot.body.setOffset(9, 5);
    robot.enemyType = "ground";
    robot.health = 70 + levelNumber * 8;
    robot.maxHealth = robot.health;
    robot.shootTime = 0;
    robot.speed = 70 + levelNumber * 4;
    this.createEnemyHealthBar(robot, 60, -60);
  }

  createFlyingRobot(x, y, levelNumber) {
    const flying = this.enemies.create(x, y, "flying_robot");
    flying.setDepth(4);
    flying.body.allowGravity = false;
    flying.enemyType = "flying";
    flying.health = 60 + levelNumber * 6;
    flying.maxHealth = flying.health;
    flying.shootTime = 0;
    flying.speed = 80 + levelNumber * 3;
    flying.startY = y;
    this.createEnemyHealthBar(flying, 60, -38);
  }

  createBoss(x, y, levelNumber, isFinalBoss) {
    const boss = this.enemies.create(x, y, isFinalBoss ? "final_boss" : "boss");
    boss.setDepth(4);
    boss.body.setSize(isFinalBoss ? 88 : 72, 120);
    boss.body.setOffset(isFinalBoss ? 16 : 14, 10);
    boss.enemyType = isFinalBoss ? "finalBoss" : "boss";
    boss.isBoss = true;
    boss.isFinalBoss = isFinalBoss;
    boss.shootTime = 0;
    boss.lastHealTime = this.time.now;
    boss.speed = isFinalBoss ? 90 : 60;

    if (levelNumber === 5) boss.health = 350;
    else if (levelNumber === 10) boss.health = 520;
    else boss.health = 850;

    boss.maxHealth = boss.health;
    this.createEnemyHealthBar(boss, isFinalBoss ? 120 : 100, isFinalBoss ? -82 : -78);
  }

  createEnemyHealthBar(enemy, width, yOffset) {
    enemy.healthBarWidth = width;
    enemy.healthBarYOffset = yOffset;
    enemy.healthBar = this.add.graphics();
    enemy.healthBar.setDepth(20);
  }

  updateEnemyHealthBars() {
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active || !enemy.healthBar) return;

      const percent = Phaser.Math.Clamp(enemy.health / enemy.maxHealth, 0, 1);
      let color = 0x22c55e;

      if (percent <= 0.3) color = 0xef4444;
      else if (percent <= 0.6) color = 0xfacc15;

      enemy.healthBar.clear();
      enemy.healthBar.fillStyle(0x020617, 1);
      enemy.healthBar.fillRect(enemy.x - enemy.healthBarWidth / 2, enemy.y + enemy.healthBarYOffset, enemy.healthBarWidth, 8);
      enemy.healthBar.fillStyle(color, 1);
      enemy.healthBar.fillRect(enemy.x - enemy.healthBarWidth / 2, enemy.y + enemy.healthBarYOffset, enemy.healthBarWidth * percent, 8);
    });
  }

  updateEnemies(time) {
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;

      if (enemy.enemyType === "ground" || enemy.enemyType === "boss") {
        const direction = this.player.x < enemy.x ? -1 : 1;
        enemy.setVelocityX(direction * enemy.speed);
      }

      if (enemy.enemyType === "flying") {
        const direction = this.player.x < enemy.x ? -1 : 1;
        enemy.setVelocityX(direction * enemy.speed);
        enemy.y = enemy.startY + Math.sin(time / 400) * 35;
      }

      if (enemy.enemyType === "finalBoss") {
        const direction = this.player.x < enemy.x ? -1 : 1;
        enemy.setVelocityX(direction * enemy.speed);
        enemy.body.allowGravity = false;
        enemy.y = 280 + Math.sin(time / 500) * 130;

        if (time > enemy.lastHealTime + 5000 && enemy.health > 0 && enemy.health < enemy.maxHealth) {
          enemy.health = Math.min(enemy.maxHealth, enemy.health + 45);
          enemy.lastHealTime = time;
        }
      }

      if (time > enemy.shootTime) {
        this.enemyShoot(enemy);
        enemy.shootTime = time + this.getEnemyShootDelay(enemy);
      }
    });
  }

  getEnemyShootDelay(enemy) {
    let baseDelay;

    if (enemy.enemyType === "finalBoss") {
      baseDelay = 1200;
    } else if (enemy.enemyType === "boss") {
      baseDelay = 1600;
    } else if (enemy.enemyType === "flying") {
      baseDelay = 1800;
    } else {
      baseDelay = 2200;
    }

    const levelSpeedBonus = (this.currentLevel - 1) * 70;
    let finalDelay = baseDelay - levelSpeedBonus;

    if (enemy.enemyType === "finalBoss") {
      finalDelay = Math.max(finalDelay, 500);
    } else if (enemy.enemyType === "boss") {
      finalDelay = Math.max(finalDelay, 650);
    } else {
      finalDelay = Math.max(finalDelay, 800);
    }

    return finalDelay;
  }

  enemyShoot(enemy) {
    const bullet = this.enemyBullets.create(enemy.x, enemy.y, "enemy_bullet");
    bullet.setDepth(8);
    bullet.body.allowGravity = false;

    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const speed = enemy.enemyType === "finalBoss" ? 330 : 240;

    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.time.delayedCall(3500, () => {
      if (bullet.active) bullet.destroy();
    });
  }

  handlePlayerMovement(deltaSeconds) {
    const movingLeft = this.keys.A.isDown || this.cursors.left.isDown;
    const movingRight = this.keys.D.isDown || this.cursors.right.isDown;
    const crouching = this.keys.S.isDown || this.cursors.down.isDown;

    if (crouching) {
      this.player.setTexture("player_crouch");
      this.player.body.setSize(34, 48);
      this.player.body.setOffset(9, 8);
    } else {
      this.player.setTexture("player");
      this.player.body.setSize(34, 70);
      this.player.body.setOffset(9, 8);
    }

    if (movingLeft) {
      this.player.setVelocityX(-230);
      this.playerFacing = -1;
      this.player.setFlipX(true);
    } else if (movingRight) {
      this.player.setVelocityX(230);
      this.playerFacing = 1;
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.keys.W.isDown || this.cursors.up.isDown) && this.player.body.blocked.down && !crouching) {
      this.player.setVelocityY(-470);
    }

    if (this.keys.SPACE.isDown && this.jetpackVisible && this.jetpackFuel > 0 && !crouching) {
      this.player.setVelocityY(-260);
      this.jetpackFuel -= 45 * deltaSeconds;
      this.jetpackFuel = Math.max(0, this.jetpackFuel);
    } else {
      this.jetpackFuel += 22 * deltaSeconds;
      this.jetpackFuel = Math.min(this.maxJetpackFuel, this.jetpackFuel);
    }
  }

  handleToggles() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.U)) this.gunVisible = !this.gunVisible;
    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) this.jetpackVisible = !this.jetpackVisible;
    if (Phaser.Input.Keyboard.JustDown(this.keys.B)) this.backpackOpen = !this.backpackOpen;
  }

  updatePlayerGear() {
    this.playerGear.clear();

    const x = this.player.x;
    const y = this.player.y;
    const facing = this.playerFacing;

    const backpackX = facing === 1 ? x - 36 : x + 18;

    this.playerGear.fillStyle(0x78350f, 1);
    this.playerGear.fillRoundedRect(backpackX, y - 31, 18, 38, 5);
    this.playerGear.fillStyle(0xf59e0b, 1);
    this.playerGear.fillRoundedRect(backpackX + 3, y - 20, 12, 8, 3);

    if (this.jetpackVisible) {
      const jetX = facing === 1 ? x - 56 : x + 40;

      this.playerGear.fillStyle(0x334155, 1);
      this.playerGear.fillRoundedRect(jetX, y - 30, 16, 44, 4);
      this.playerGear.fillStyle(0x00ffcc, 1);
      this.playerGear.fillCircle(jetX + 8, y - 8, 4);

      if (this.keys.SPACE.isDown && this.jetpackFuel > 0) {
        const flameSize = Phaser.Math.Between(18, 34);

        this.playerGear.fillStyle(0x38bdf8, 0.95);
        this.playerGear.fillTriangle(jetX + 8, y + 16, jetX - 4, y + 16 + flameSize, jetX + 20, y + 16 + flameSize);

        this.playerGear.fillStyle(0xfacc15, 0.9);
        this.playerGear.fillTriangle(jetX + 8, y + 16, jetX + 2, y + 12 + flameSize, jetX + 14, y + 12 + flameSize);
      }
    }

    if (this.gunVisible) {
      const gunX = facing === 1 ? x + 22 : x - 88;
      const gunY = y - 16;

      this.playerGear.fillStyle(0x7f1d1d, 1);
      this.playerGear.fillRoundedRect(gunX, gunY, 66, 14, 3);

      this.playerGear.fillStyle(0xef4444, 1);
      this.playerGear.fillRoundedRect(gunX + 6, gunY - 8, 30, 6, 2);

      this.playerGear.fillStyle(0xf87171, 1);
      this.playerGear.fillRoundedRect(facing === 1 ? gunX + 40 : gunX - 8, gunY + 3, 28, 7, 2);

      this.playerGear.fillStyle(0xff0000, 1);
      this.playerGear.fillRoundedRect(facing === 1 ? gunX + 63 : gunX - 12, gunY + 1, 9, 11, 2);

      this.playerGear.fillStyle(0x450a0a, 1);
      this.playerGear.fillRoundedRect(gunX + 17, gunY + 12, 10, 20, 3);
    }
  }

  getShootDirection() {
    let x = this.playerFacing;
    let y = 0;

    if (this.cursors.up.isDown) {
      y = -1;

      if (this.cursors.left.isDown) x = -1;
      else if (this.cursors.right.isDown) x = 1;
      else x = 0;
    } else {
      if (this.cursors.left.isDown) x = -1;
      else if (this.cursors.right.isDown) x = 1;
    }

    const length = Math.sqrt(x * x + y * y) || 1;

    return {
      x: x / length,
      y: y / length
    };
  }

  handleShooting(time) {
    if (!this.gunVisible) return;

    if (this.keys.J.isDown && time > this.shootCooldown) {
      const dir = this.getShootDirection();

      const bullet = this.bullets.create(this.player.x + dir.x * 30, this.player.y - 10, "bullet");
      bullet.setDepth(8);
      bullet.body.allowGravity = false;
      bullet.damage = 28;
      bullet.setVelocity(dir.x * 650, dir.y * 650);
      bullet.rotation = Math.atan2(dir.y, dir.x);

      this.playBulletSound();

      this.shootCooldown = time + 230;

      this.time.delayedCall(1800, () => {
        if (bullet.active) bullet.destroy();
      });
    }
  }

  handleGrenade(time) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.K) && time > this.grenadeCooldown) {
      const grenade = this.grenades.create(this.player.x + this.playerFacing * 25, this.player.y - 20, "grenade");
      grenade.setDepth(8);
      grenade.setVelocity(this.playerFacing * 350, -360);
      grenade.setBounce(0.4);

      this.grenadeCooldown = time + 1200;

      this.time.delayedCall(1200, () => {
        if (grenade.active) {
          this.explodeAt(grenade.x, grenade.y, 130, 90, 10);
          grenade.destroy();
        }
      });
    }
  }

  handleLaser(time) {
    if (!this.gunVisible) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE) && this.backpack.laser > 0 && time > this.laserCooldown) {
      this.backpack.laser--;
      this.playLaserSound();
      this.laserCooldown = time + 600;

      const dir = this.getShootDirection();
      const startX = this.player.x;
      const startY = this.player.y - 12;
      const endX = startX + dir.x * 700;
      const endY = startY + dir.y * 700;

      const beam = this.add.graphics().setDepth(30);

      beam.lineStyle(14, 0x22d3ee, 0.25);
      beam.beginPath();
      beam.moveTo(startX, startY);
      beam.lineTo(endX, endY);
      beam.strokePath();

      beam.lineStyle(6, 0xffffff, 0.9);
      beam.beginPath();
      beam.moveTo(startX, startY);
      beam.lineTo(endX, endY);
      beam.strokePath();

      beam.lineStyle(3, 0x00ffcc, 1);
      beam.beginPath();
      beam.moveTo(startX, startY);
      beam.lineTo(endX, endY);
      beam.strokePath();

      this.time.delayedCall(120, () => beam.destroy());

      this.enemies.getChildren().forEach(enemy => {
        if (!enemy.active) return;

        const d = this.distancePointToSegment(enemy.x, enemy.y, startX, startY, endX, endY);

        if (d < 45) {
          this.createBulletImpactFlash(enemy.x, enemy.y);
          this.damageEnemy(enemy, 180);
        }
      });
    }
  }

  handleBazooka(time) {
    if (!this.gunVisible) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO) && this.backpack.bazooka > 0 && time > this.rocketCooldown) {
      this.backpack.bazooka--;
      this.rocketCooldown = time + 900;

      const dir = this.getShootDirection();

      const rocket = this.rockets.create(this.player.x + dir.x * 35, this.player.y - 12, "bazooka");
      rocket.setDepth(8);
      rocket.body.allowGravity = false;
      rocket.setVelocity(dir.x * 430, dir.y * 430);
      rocket.rotation = Math.atan2(dir.y, dir.x);

      this.time.delayedCall(2500, () => {
        if (rocket.active) {
          this.explodeAt(rocket.x, rocket.y, 160, 160, 2);
          rocket.destroy();
        }
      });
    }
  }

  bulletHitsEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    this.createBulletImpactFlash(bullet.x, bullet.y);
    this.damageEnemy(enemy, bullet.damage || 25);
    bullet.destroy();
  }

  rocketHitsEnemy(rocket, enemy) {
    if (!rocket.active || !enemy.active) return;

    this.createBulletImpactFlash(rocket.x, rocket.y);
    this.explodeAt(rocket.x, rocket.y, 170, 160, 2);
    rocket.destroy();
  }

  enemyBulletHitsPlayer(player, bullet) {
    if (!bullet.active) return;

    bullet.destroy();
    this.damagePlayer(12);
  }

  enemyTouchesPlayer(player, enemy) {
    if (this.time.now < this.playerInvincibleUntil) return;

    this.damagePlayer(enemy.isBoss ? 22 : 10);
    this.playerInvincibleUntil = this.time.now + 800;
  }

  damageEnemy(enemy, amount) {
    enemy.health -= amount;

    if (enemy.health <= 0) {
      this.destroyEnemy(enemy);
    }
  }

  destroyEnemy(enemy) {
    this.playEnemyDeathSound();
    this.createEnemyDeathParticles(enemy.x, enemy.y);
    this.showExplosion(enemy.x, enemy.y);

    if (enemy.healthBar) enemy.healthBar.destroy();

    if (enemy.isBoss) this.score += enemy.isFinalBoss ? 1000 : 500;
    else this.score += 100;

    enemy.destroy();
  }

  damagePlayer(amount) {
    if (this.gameOver || this.gameWon) return;

    this.playerHealth -= amount;
    this.playerHealth = Math.max(0, this.playerHealth);

    this.cameras.main.shake(120, 0.01);

    if (this.playerHealth <= 0) {
      this.showDeathScreen();
    }
  }

  explodeAt(x, y, radius, damage, maxHits) {
    this.showExplosion(x, y);

    const targets = this.enemies.getChildren()
      .filter(e => e.active)
      .map(e => ({
        enemy: e,
        distance: Phaser.Math.Distance.Between(x, y, e.x, e.y)
      }))
      .filter(item => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxHits);

    targets.forEach(item => this.damageEnemy(item.enemy, damage));
  }

  showExplosion(x, y) {
    this.playExplosionSound();

    const boom = this.add.image(x, y, "explosion").setDepth(40);
    boom.setScale(0.5);

    this.cameras.main.shake(180, 0.01);

    this.tweens.add({
      targets: boom,
      scale: 2.2,
      alpha: 0,
      duration: 350,
      ease: "Quad.easeOut",
      onComplete: () => boom.destroy()
    });
  }

  createEnemyDeathParticles(x, y) {
    for (let i = 0; i < 18; i++) {
      const color = Phaser.Math.RND.pick([0x8b949e, 0x64748b, 0x00ffcc, 0xef4444, 0xffffff]);

      const particle = this.add.rectangle(
        x,
        y,
        Phaser.Math.Between(4, 8),
        Phaser.Math.Between(4, 8),
        color
      );

      particle.setDepth(45);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(25, 90);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        angle: Phaser.Math.Between(-180, 180),
        scale: 0.2,
        duration: Phaser.Math.Between(350, 650),
        ease: "Quad.easeOut",
        onComplete: () => particle.destroy()
      });
    }
  }

  createBulletImpactFlash(x, y) {
    const flash = this.add.graphics();
    flash.setDepth(50);

    flash.fillStyle(0xffffff, 0.95);
    flash.fillCircle(x, y, 8);

    flash.lineStyle(3, 0x00ffcc, 1);
    flash.strokeCircle(x, y, 14);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.8,
      duration: 120,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy()
    });
  }

  handleHealing() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
      if (this.backpack.medkit > 0 && this.playerHealth < this.playerMaxHealth) {
        this.backpack.medkit--;
        this.playerHealth += 35;
        this.playerHealth = Math.min(this.playerHealth, this.playerMaxHealth);
      }
    }
  }

  spawnPickupsForLevel(levelNumber) {
    const baseX = Math.min(this.player.x + 220, this.worldWidth - 900);

    this.createPickup(baseX, this.groundY - 25, "medkit");
    this.createPickup(baseX + 180, this.groundY - 25, "medkit");

    if (levelNumber === 5 || levelNumber === 10 || levelNumber === 15) {
      this.createPickup(baseX + 330, this.groundY - 25, "medkit");
    }

    if (levelNumber === 2 || levelNumber === 6 || levelNumber === 11) {
      this.createPickup(baseX + 460, this.groundY - 25, "laser");
    }

    if (levelNumber === 4 || levelNumber === 9 || levelNumber === 13) {
      this.createPickup(baseX + 560, this.groundY - 25, "bazooka");
    }
  }

  createPickup(x, y, type) {
    let texture = "medkit";

    if (type === "laser") texture = "laser";
    if (type === "bazooka") texture = "bazooka";

    const item = this.pickups.create(x, y, texture);
    item.pickupType = type;
    item.setDepth(5);
    item.setScale(1.15);

    let glowColor = 0x22c55e;
    if (type === "laser") glowColor = 0x22d3ee;
    if (type === "bazooka") glowColor = 0xf97316;

    item.glow = this.add.circle(x, y, 24, glowColor, 0.18).setDepth(4);

    this.tweens.add({
      targets: [item, item.glow],
      y: y - 8,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: item,
      angle: 8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: item.glow,
      scale: 1.25,
      alpha: 0.05,
      duration: 700,
      yoyo: true,
      repeat: -1
    });
  }

  pickupItem(player, item) {
    if (item.pickupType === "medkit") this.backpack.medkit++;
    if (item.pickupType === "laser") this.backpack.laser++;
    if (item.pickupType === "bazooka") this.backpack.bazooka++;

    const pickupText = this.add.text(item.x, item.y - 35, "+1 " + item.pickupType.toUpperCase(), {
      fontSize: "16px",
      color: "#00ffcc",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: pickupText,
      y: pickupText.y - 35,
      alpha: 0,
      duration: 700,
      onComplete: () => pickupText.destroy()
    });

    if (item.glow) item.glow.destroy();
    item.destroy();
  }

  checkLevelComplete() {
    if (this.transitionActive) return;

    const aliveEnemies = this.enemies.getChildren().filter(e => e.active);

    if (aliveEnemies.length === 0) {
      if (this.currentLevel >= this.maxLevel) {
        this.showVictoryScreen();
        return;
      }

      this.transitionActive = true;
      this.statusText.setText("Level Complete!");
      this.statusText.setColor("#00ffcc");
      this.showLevelTransition(this.currentLevel + 1);
    }
  }

  showLevelTransition(nextLevel) {
    this.showEnemySpeedWarning(nextLevel);

    const flash = this.add.rectangle(450, 300, 900, 600, 0x00ffcc, 0).setScrollFactor(0).setDepth(200);

    const text = this.add.text(450, 300, "LEVEL " + nextLevel, {
      fontSize: "60px",
      color: "#00ffcc",
      fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0).setScale(0.45);

    this.tweens.add({
      targets: flash,
      alpha: 0.25,
      duration: 130,
      yoyo: true,
      repeat: 2,
      onComplete: () => flash.destroy()
    });

    this.tweens.add({
      targets: text,
      alpha: 1,
      scale: 1,
      duration: 550,
      ease: "Back.easeOut",
      onComplete: () => {
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: text,
            alpha: 0,
            scale: 1.25,
            duration: 450,
            ease: "Quad.easeIn",
            onComplete: () => {
              text.destroy();
              this.startLevel(nextLevel);
            }
          });
        });
      }
    });
  }

  showEnemySpeedWarning(nextLevel) {
    if (nextLevel <= 1) return;

    const warningText = this.add.text(450, 215, "ENEMIES ARE GETTING FASTER!", {
      fontSize: "30px",
      color: "#ff4444",
      fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(230).setAlpha(0);

    this.tweens.add({
      targets: warningText,
      alpha: 1,
      y: 195,
      duration: 350,
      ease: "Back.easeOut",
      yoyo: true,
      hold: 1400,
      onComplete: () => warningText.destroy()
    });

    this.createRedEdgeFlash();
  }

  createRedEdgeFlash() {
    const topEdge = this.add.rectangle(450, 10, 900, 20, 0xff0000, 0).setScrollFactor(0).setDepth(225);
    const bottomEdge = this.add.rectangle(450, 590, 900, 20, 0xff0000, 0).setScrollFactor(0).setDepth(225);
    const leftEdge = this.add.rectangle(10, 300, 20, 600, 0xff0000, 0).setScrollFactor(0).setDepth(225);
    const rightEdge = this.add.rectangle(890, 300, 20, 600, 0xff0000, 0).setScrollFactor(0).setDepth(225);

    const edges = [topEdge, bottomEdge, leftEdge, rightEdge];

    this.tweens.add({
      targets: edges,
      alpha: 0.65,
      duration: 150,
      yoyo: true,
      repeat: 3,
      onComplete: () => edges.forEach(edge => edge.destroy())
    });
  }

  clearLevelObjects() {
    if (this.enemies) {
      this.enemies.getChildren().forEach(e => {
        if (e.healthBar) e.healthBar.destroy();
        e.destroy();
      });
    }

    if (this.bullets) this.bullets.clear(true, true);
    if (this.enemyBullets) this.enemyBullets.clear(true, true);
    if (this.grenades) this.grenades.clear(true, true);
    if (this.rockets) this.rockets.clear(true, true);

    if (this.pickups) {
      this.pickups.getChildren().forEach(item => {
        if (item.glow) item.glow.destroy();
        item.destroy();
      });
    }
  }

  showDeathScreen() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.saveScoreRecord();
    this.stopBackgroundAmbience();

    const overlay = this.add.rectangle(450, 300, 900, 600, 0x000000, 0.75).setScrollFactor(0).setDepth(300);

    const deadText = this.add.text(450, 230, "PLAYER IS DEAD", {
      fontSize: "56px",
      color: "#ef4444",
      fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const restartBtn = this.makeButton(450, 340, "RESTART", () => this.scene.restart());
    restartBtn.setDepth(302);

    const menuBtn = this.makeButton(450, 420, "MAIN MENU", () => this.scene.restart());
    menuBtn.setDepth(302);

    this.menuObjects.push(overlay, deadText, restartBtn, menuBtn);
  }

  showVictoryScreen() {
    if (this.gameWon) return;

    this.gameWon = true;
    this.saveScoreRecord();
    this.stopBackgroundAmbience();

    const overlay = this.add.rectangle(450, 300, 900, 600, 0x000000, 0.75).setScrollFactor(0).setDepth(300);

    const winText = this.add.text(450, 210, "YOU WON THE WAR!", {
      fontSize: "52px",
      color: "#00ffcc",
      fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const statsText = this.add.text(
      450,
      290,
      "Final Score: " + this.score + "\nTotal Time: " + this.formatTime(Math.floor(this.elapsedTime)),
      {
        fontSize: "26px",
        color: "#ffffff",
        align: "center"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const restartBtn = this.makeButton(450, 400, "PLAY AGAIN", () => this.scene.restart());
    restartBtn.setDepth(302);

    const menuBtn = this.makeButton(450, 480, "MAIN MENU", () => this.scene.restart());
    menuBtn.setDepth(302);

    this.menuObjects.push(overlay, winText, statsText, restartBtn, menuBtn);
  }

  createSoundSystem() {
    if (this.soundReady) return;
    if (!this.sound || !this.sound.context) return;

    this.audioContext = this.sound.context;

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.35;
    this.masterGain.connect(this.audioContext.destination);

    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.gain.value = 0.7;
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0.18;
    this.musicGain.connect(this.masterGain);

    this.ambienceNodes = [];
    this.soundReady = true;
  }

  playTone(type, startFreq, endFreq, duration, volume) {
    if (!this.soundReady || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  playNoiseBurst(duration, volume, filterFrequency) {
    if (!this.soundReady || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFrequency, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  playBulletSound() {
    this.playTone("square", 260, 90, 0.08, 0.25);
    this.playNoiseBurst(0.04, 0.12, 900);
  }

  playLaserSound() {
    this.playTone("sawtooth", 950, 180, 0.18, 0.22);
    this.playTone("triangle", 1400, 500, 0.12, 0.12);
  }

  playExplosionSound() {
    this.playNoiseBurst(0.55, 0.45, 700);
    this.playTone("sine", 95, 35, 0.45, 0.35);
  }

  playEnemyDeathSound() {
    this.playTone("triangle", 700, 1200, 0.08, 0.18);

    this.time.delayedCall(70, () => {
      this.playTone("triangle", 500, 250, 0.12, 0.16);
    });
  }

  startBackgroundAmbience() {
    if (!this.soundReady || !this.audioContext) return;
    if (this.ambienceNodes.length > 0) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(45, now);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(62, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 1.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc1.start(now);
    osc2.start(now);

    this.ambienceNodes = [osc1, osc2, filter, gain];
  }

  stopBackgroundAmbience() {
    if (!this.soundReady || this.ambienceNodes.length === 0) return;

    const now = this.audioContext.currentTime;
    const gain = this.ambienceNodes[3];

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

    this.time.delayedCall(550, () => {
      this.ambienceNodes.forEach(node => {
        if (node.stop) {
          try {
            node.stop();
          } catch (e) {}
        }
      });

      this.ambienceNodes = [];
    });
  }

  distancePointToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx;
    let yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const minuteText = minutes < 10 ? "0" + minutes : "" + minutes;
    const secondText = seconds < 10 ? "0" + seconds : "" + seconds;

    return minuteText + ":" + secondText;
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 900,
  height: 600,
  backgroundColor: "#0f172a",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scene: WarGame
};

const game = new Phaser.Game(config);
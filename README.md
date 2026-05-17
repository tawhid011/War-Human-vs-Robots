# War Human vs Robots

War Human vs Robots is a 2D browser game built with Phaser 3. The game is about a human fighter battling against robots through multiple levels, using weapons, healing items, a jetpack, and special pickups to survive.

The game is made step by step as a learning project for building 2D games with JavaScript and Phaser.

## Game Features

- 2D side-scrolling gameplay
- Human player drawn with Phaser graphics
- Robot enemies
- Flying robot enemies in later levels
- Boss fights
- Final boss battle
- 15-level progression system
- Player health system
- Jetpack fuel system
- Gun toggle system
- Directional shooting
- Grenades
- Laser weapon pickup
- Bazooka weapon pickup
- Medkit healing pickup
- Backpack inventory system
- Score system
- Scoreboard storing top 10 scores
- Game timer
- Level transition screen
- Enemy speed warning system
- Bullet impact effects
- Enemy death particles
- Explosion effects
- Screen shake
- Procedural sound effects with Web Audio
- Dark city background with buildings, clouds, and road

## Controls

| Key | Action |
|---|---|
| A / Left Arrow | Move left |
| D / Right Arrow | Move right |
| W / Up Arrow | Jump |
| S / Down Arrow | Crouch |
| U | Show or hide gun |
| J | Shoot |
| Arrow Keys + J | Directional shooting |
| K | Throw grenade |
| L | Show or hide jetpack |
| Space | Fly with jetpack |
| B | Open backpack |
| 1 | Use laser |
| 2 | Use bazooka |
| H | Use medkit |

## Level System

The game has 15 levels.

- Levels 1 to 4 include ground robots.
- Level 5 has a boss fight.
- Levels 6 to 9 continue with stronger ground robots.
- Level 10 has another boss fight.
- Levels 11 to 14 add flying robot enemies.
- Level 15 has the final boss.

As the level increases, enemies shoot faster and become harder to defeat.

## Weapons and Items

### Normal Gun
The player can toggle the gun with `U` and shoot with `J`.

### Grenade
The player can throw grenades with `K`.

### Laser
Laser is a special pickup weapon. It can deal strong damage but has limited use.

### Bazooka
Bazooka is a powerful pickup weapon that can damage multiple robots with an explosion.

### Medkit
Medkits are used to heal the player. They are stored in the backpack and used with `H`.

### Jetpack
The jetpack can be toggled with `L`. When active, the player can fly using `Space`, but fuel is limited and must recharge.

## Scoreboard

The game stores the top 10 scores using browser localStorage. The scoreboard shows:

- Score
- Level reached
- Time played

## Technology Used

- HTML
- CSS
- JavaScript
- Phaser 3
- Web Audio API

## How to Run the Game

1. Download or clone this repository.
2. Open the folder in VS Code.
3. Install the Live Server extension if you do not have it.
4. Right-click `index.html`.
5. Click `Open with Live Server`.

The game should open in your browser.

Important: Do not open the file directly with `file:///`. Use Live Server.

## Project Files

```txt
War-Human-vs-Robots/
  index.html
  main.js
  README.md
```

## Future Improvements

- Add real sprite art
- Add background music files
- Add more enemy types
- Add better boss attack patterns
- Add mobile controls
- Add pause menu
- Add settings menu
- Add save/load system
- Add more levels
- Add story cutscenes

## Author

Created by Researchers Figurative language as a Phaser 3 learning project.

class Game {
    timeouts = [];
    conditions = [];

    ships = [];
    leftShips = [];
    teams = [];

    aliens = [];

    asteroids = [];
    timedAsteroids = [];
    
    isGameOver = false;

    static C = {
        OPTIONS: {
            ROOT_MODE: '',
            MAP_SIZE: 100,
            MAP: null,
            ASTEROIDS_STRENGTH: 1,
            RELEASE_CRYSTAL: true,
            CRYSTAL_DROP: 1,
            CRYSTAL_VALUE: 2,

            FRIENDLY_COLORS: 2,

            RADAR_ZOOM: 3,

            SPEED_MOD: 1.5,
            FRICTION_RATIO: 1,

            WEAPONS_STORE: false,
            PROJECTILE_SPEED: 1,

            STARTING_SHIP: 800,
            RESET_TREE: false,
            CHOOSE_SHIP: null,
            SHIPS: [],
            MAX_PLAYERS: 20,

            VOCABULARY: [
                { text: "Yes", icon: "\u004c", key: "Y" },
                { text: "No", icon: "\u004d", key: "N" },
                { text: "Defend", icon: "\u0025", key: "D" },
                { text: "Kill", icon: "\u007f", key: "K" },
                { text: "Sorry", icon: "\u00a1", key: "S" },
                { text: "Thanks", icon: "\u0041", key: "X" },
                { text: "You", icon: "\u004e", key: "O" },
                { text: "Me", icon: "\u004f", key: "E" },
                { text: "No Problem", icon: "\u0047", key: "P" },
                { text: "Attack", icon: "\u0049", key: "A" },
                { text: "Help", icon: "\u004a", key: "H" },
                { text: "Hmmm?", icon: "\u004b", key: "Q" },
                { text: "GoodGame", icon: "\u00a3", key: "G" },
                { text: "Wait", icon: "\u0048", key: "T" },
                { text: "Follow", icon: "\u0050", key: "F" },
                { text: "Love", icon: "\u0024", key: "L" },
                { text: "Base", icon: "\u0034", key: "B" },
                { text: "Bruh", icon: "˙ ͜ʟ˙", key: "M" },
                { text: "WTF", icon: "ಠ_ಠ", key: "W" }
            ],
        },
        TICKS: {
            TICKS_PER_SECOND: 60,
            MILLISECONDS_PER_TICK: 1000 / 60,

            ENTITY_MANAGER: 60,
            SHIP_MANAGER: 20,
            SHIP_MANAGER_FAST: 5,

            BASE_MANAGER: 360,
            FAST_BASE_MANAGER: 5,

            RESET_STAGGER: 5,

            GAME_MANAGER: 30
        },
        IS_DEBUGGING: false,
    }

    constructor() {
        this.reset();
    }

    tick() {
        this.manageTimeouts();
        this.manageConditions();
        this.manageEntities();

        this.manageGameState();

        this.manageShips();

        this.manageBases();

        this.tickTimedEntities();
    }

    manageTimeouts() {
        let removedTimeouts = [];
        for (let i = 0; i < this.timeouts.length; i++) {
            let timeout = this.timeouts[i];
            if (timeout.running) {
                timeout.tick();
            } else {
                removedTimeouts.push(timeout);
            }
        }
        for (let timeout of removedTimeouts) {
            Helper.deleteFromArray(this.timeouts, timeout);
        }
    }

    manageConditions() {
        let removedConditions = [];
        for (let i = 0; i < this.conditions.length; i++) {
            let condition = this.conditions[i];
            if (condition.running) {
                condition.tick();
            } else {
                removedConditions.push(condition);
            }
        }
        for (let condition of removedConditions) {
            Helper.deleteFromArray(this.conditions, condition);
        }
    }

    reset() {
        this.deleteEverything();
        this.resetShips();
        this.resetContainers();
        this.timeouts.push(new TimeoutCreator(() => {
            this.selectRandomTeams();
            this.spawnBases();
        }, Game.C.TICKS.RESET_STAGGER).start());
    }

    resetContainers() {
    }

    deleteEverything() {
        for (let alien of game.aliens) {
            alien.set({ kill: true });
        }
        for (let asteroid of game.asteroids) {
            asteroid.set({ size: 1, kill: true });
        }
        for (let ship of game.ships) {
            ship.emptyWeapons();
        }

        this.deleteObjs();

        game.removeObject();
    }

    deleteObjs() {
        for (let team of this.teams) {
            team.base.destroySelf();
        }
    }

    selectRandomTeams() {
        this.teams = [];
        let availableTeamOptions = Helper.deepCopy(Team.C.TEAMS);
        for (let i = 0; i < Game.C.OPTIONS.FRIENDLY_COLORS / 2; i++) {
            let randIndex = Helper.getRandomInt(0, availableTeamOptions.length - 1);
            let randTeamOption = availableTeamOptions[randIndex];
            availableTeamOptions.splice(randIndex, 1);
            for (let teamOption of randTeamOption) {
            if (this.teams.length < Game.C.OPTIONS.FRIENDLY_COLORS) {
                this.teams.push(
                new Team(
                    this.teams.length,
                    teamOption.COLOR,
                    teamOption.HEX,
                    teamOption.NAME,
                    teamOption.HUE,
                    teamOption.FLAGGED
                )
                );
            }
            }
        }
    }

    spawnBases() {
        for (let team of this.teams) {
            team.spawnBase();
        }
    }

    resetShips() {
        this.ships = Helper.shuffleArray(this.ships);
        for (let i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];
            ship.timeouts.push(new TimeoutCreator(() => {
                this.resetShip(ship);                
            }, Game.C.TICKS.RESET_STAGGER * i).start())
        }
        this.timeouts.push(new TimeoutCreator(() => {
            this.isResetting = false;
        }, Game.C.TICKS.RESET_STAGGER * (this.ships.length + 1)).start());
    }

    resetShip(ship) {
        ship.isResetting = true;

        ship.reset();
        
        ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);

        this.resetShipNext(ship);
    }

    resetShipNext(ship) {
        if (this.teams.length == 2) {
            if (this.teams[0].ships.length < this.teams[1].ships.length) {
                this.teams[1].removeShip(ship);
                ship.setTeam(this.teams[0]);
            }
            else if (this.teams[1].ships.length < this.teams[0].ships.length) {
                this.teams[0].removeShip(ship);
                ship.setTeam(this.teams[1]);
            } else {
                if (this.teams[0].score < this.teams[1].score) {
                    this.teams[1].removeShip(ship);
                    ship.setTeam(this.teams[0]);
                } else if (this.teams[1].score < this.teams[0].score) {
                    this.teams[0].removeShip(ship);
                    ship.setTeam(this.teams[1]);
                } else {
                    let randTeam = this.teams[Helper.getRandomInt(0, 1)];
                    this.teams[(randTeam.team + 1) % 2].removeShip(ship);
                    ship.setTeam(randTeam);
                }
            }
        }
        ship.hideAllUIs();
        ship.isResetting = false;
    }

    gameOver() {
        this.isGameOver = true;
        for (let ship of this.ships) {
            ship.gameOver();
        }
    }

    getMinScore(team) {
        let minScore = Infinity;
        for (let ship of team.ships) {
            if (ship.score < minScore) {
                minScore = ship.score;
            }
        }
        return minScore;
    }

    getWinningTeam() {
        let team0 = this.teams[0];
        let team1 = this.teams[1];
        if (team0.score > team1.score) {
            return team0;
        }
        else if (team1.score > team0.score) {
            return team1;
        }
        else {
            return null;
        }
    }

    manageGameState() {
        if (this.isGameOver) {
            this.gameOver();
        }
        if (this.isResetting) return;
        if (game.step % Game.C.TICKS.GAME_MANAGER == 0) {
            
        }
    }

    tickTimedEntities() {
        let removedTimedAsteroids = [];
        let removedAsteroids = [];
        for (let timedAsteroid of this.timedAsteroids) {
            timedAsteroid.tick();
            if (!timedAsteroid.running) {
                removedTimedAsteroids.push(timedAsteroid);
                removedAsteroids.push(timedAsteroid.asteroid);
            }
        }
        for (let timedAsteroid of removedTimedAsteroids) {
            Helper.deleteFromArray(this.timedAsteroids, timedAsteroid);
            Helper.deleteFromArray(this.asteroids, timedAsteroid.asteroid);
        }
    }

    manageEntities() {
        if (game.step % Game.C.TICKS.ENTITY_MANAGER === 0) {
            let notFoundAsteroids = [];
            for (let asteroid of this.asteroids) {
                let found = false;
                for (let gameAsteroid of game.asteroids) {
                    if (asteroid.asteroid == gameAsteroid) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    notFoundAsteroids.push(asteroid);
                }
            }
            for (let asteroid of notFoundAsteroids) {
                Helper.deleteFromArray(this.asteroids, asteroid);
            }

            let notFoundAliens = [];
            for (let alien of this.aliens) {
                let found = false;
                for (let gameAlien of game.aliens) {
                    if (alien.alien == gameAlien) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    notFoundAliens.push(alien);
                }
            }
            for (let alien of notFoundAliens) {
                Helper.deleteFromArray(this.aliens, alien);
            }

            let notFoundShips = [];
            for (let ship of this.ships) {
                let found = false;
                for (let gameShip of game.ships) {
                    if (ship.ship.id == gameShip.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    notFoundShips.push(ship);
                }
            }
            for (let ship of notFoundShips) {
                if (ship.team) {
                    ship.team.removeShip(ship);
                }
                Helper.deleteFromArray(this.ships, ship);
                let hasLeftShip = false;
                for (let leftShip of this.leftShips) {
                    if (leftShip.ship.id == ship.ship.id) {
                        hasLeftShip = true;
                        break;
                    }
                }
                if (!hasLeftShip) {
                    ship.left = true;
                    this.leftShips.push(ship);
                }
            }

            // check if the gameShip is there, but is not recorded in this.ships, if so, then this.onShipSpawned
            for (let gameShip of game.ships) {
                let found = false;
                for (let ship of this.ships) {
                    if (ship.ship.id == gameShip.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this.onShipSpawned(gameShip);
                }
            }
        }
    }

    manageShips() {
        if (!this.isResetting && game.step % Game.C.TICKS.SHIP_MANAGER === 0) {
            for (let ship of this.ships) {
                if (!ship.done) {
                    this.resetShip(ship);
                    ship.done = true;

                    this.handleShipSpawnLerp(ship);
                }

                if (!ship.isResetting) {
                    this.handleShipDepotEnterLerp(ship);

                    this.handleWeaponsStore(ship);
                }
            }
        }
        if (game.step % Game.C.TICKS.SHIP_MANAGER_FAST === 0) {
            for (let ship of this.ships) {
                if (!ship.resetting) {
                    this.handleShipTurretUse(ship);
                }

                ship.tick();
            }
        }
    }

    manageBases() {
        if (game.step % Game.C.TICKS.BASE_MANAGER === 0) {
            for (let team of this.teams) {
                if (team.base) {
                    team.base.tick();
                }
            }
        }
        if (game.step % Game.C.TICKS.FAST_BASE_MANAGER === 0) {
            for (let team of this.teams) {
                if (team.base) {
                    for (let safeAlien of team.base.safeAliens) {
                        safeAlien.tick();
                    }
                    for (let turretBaseModule of team.base.turretBaseModules) {
                        turretBaseModule.tick();
                    }
                }
            }
            this.handleTurretAutoAim();
        }
    }

    getOppTeam(team) {
        for (let i = 0; i < this.teams.length; i++) {
            if (this.teams[i].team != team.team) {
                return this.teams[i];
            }
        }
    }

    sendNotifications(title, message, supportingTeam) {
        for (let ship of this.ships) {
            let notification = Helper.deepCopy(UIComponent.C.UIS.NOTIFICATION);
            if (supportingTeam.team == ship.team.team) {
                notification.components[0].stroke = '#00ff00';
            }
            else {
                notification.components[0].stroke = '#ff0000';
            }
            notification.components[1].value = title;
            notification.components[2].value = message;
            ship.sendTimedUI(notification);
        }
    }

    findShip(gameShip) {
        for (let ship of this.ships) {
            if (ship.ship == gameShip || ship.ship.id == gameShip.id) {
                return ship;
            }
        }
        for (let ship of this.leftShips) {
            if (ship.ship == gameShip || ship.ship.id == gameShip.id) {
                return ship;
            }
        }
        return null;
    }

    findSafeAlien(gameAlien) {
        for (let team of this.teams) {
            if (team.base) {
                for (let safeAlien of team.base.safeAliens) {
                    if (safeAlien.alien.alien == gameAlien || safeAlien.alien.alien.custom.id == gameAlien.custom.id) {
                        return safeAlien;
                    }
                }
            }
        }
        return null;
    }

    findAlien(gameAlien) {
        for (let alien of this.aliens) {
            if (alien.alien == gameAlien || alien.alien.id == gameAlien.id) {
                return alien;
            }
        }
        return null;
    }

    handleShipSpawnLerp(ship) {
        if (ship.team) {
            let spawnModule = Helper.getRandomArrayElement(ship.team.base.spawnBaseModules);
            if (spawnModule) {
                let spawnInitialPose = spawnModule.pose.clone();
                spawnInitialPose.position = spawnInitialPose.position.add(new Vector2(SpawnBaseModule.C.SPAWN_INITIAL_OFFSET.x, SpawnBaseModule.C.SPAWN_INITIAL_OFFSET.y).rotateBy(spawnModule.pose.rotation));
                ship.setPosition(spawnInitialPose.position);
                ship.setVelocity(new Vector2(0, 0));

                let spawnFinalPose = spawnModule.pose.clone();
                spawnFinalPose.position = spawnFinalPose.position.add(new Vector2(SpawnBaseModule.C.SPAWN_FINAL_OFFSET.x, SpawnBaseModule.C.SPAWN_FINAL_OFFSET.y).rotateBy(spawnModule.pose.rotation));
                spawnFinalPose.rotation += Math.PI;
                ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.EXIT_SPAWN.NAME, spawnFinalPose, ShipLerp.C.TYPES.EXIT_SPAWN.BLEND_FACTOR, spawnModule, true, SpawnBaseModule.C.SPAWN_DELAY);
            }
        }
    }

    handleShipDepotEnterLerp(ship) {
        if (ship.team) {
            let depotModules = ship.team.base.depotBaseModules;
            for (let depotModule of depotModules) {
                let suckRectangle = new Rectangle(new Vector2(DepotBaseModule.C.SUCK_RECTANGLE.CENTER.x, DepotBaseModule.C.SUCK_RECTANGLE.CENTER.y).rotateBy(depotModule.pose.rotation).add(depotModule.pose.position), new Vector2(DepotBaseModule.C.SUCK_RECTANGLE.SIZE.x, DepotBaseModule.C.SUCK_RECTANGLE.SIZE.y), depotModule.pose.rotation);
                let shipPosition = ship.getPosition();
                if (shipPosition && suckRectangle.containsPoint(shipPosition) && !ship.lerp && Helper.angleWithinThreshold(ship.getPose().rotation, depotModule.pose.rotation, DepotBaseModule.C.ANGLE_THRESHOLD)) {
                    ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.ENTER_DEPOT.NAME, depotModule.pose, ShipLerp.C.TYPES.ENTER_DEPOT.BLEND_FACTOR, depotModule, false);

                    ship.inDepot = depotModule;
                }
            }
        }
    }

    handleShipDepotExitLerp(ship) {
        if (ship.team && ship.inDepot) {
            let depotModule = ship.inDepot;
            let depotFinalPose = depotModule.pose.clone();
            depotFinalPose.position = depotFinalPose.position.add(new Vector2(DepotBaseModule.C.DEPOT_FINAL_OFFSET.x, DepotBaseModule.C.DEPOT_FINAL_OFFSET.y).rotateBy(depotModule.pose.rotation));
            depotFinalPose.rotation += Math.PI;
            ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.EXIT_DEPOT.NAME, depotFinalPose, ShipLerp.C.TYPES.EXIT_DEPOT.BLEND_FACTOR, depotModule, true);
            ship.inDepot = null;
        }
    }

    handleWeaponsStore(ship) {
        if (!ship.inDepot) {
            
            ship.hideUI(UIComponent.C.UIS.WEAPONS_STORE);
            ship.hideUI(UIComponent.C.UIS.WEAPONS_STORE_EXIT);
            // ship.hideUI(UIComponent.C.UIS.WEAPONS_STORE_HEALING);

            ship.hideUIsIncludingID(UIComponent.C.UIS.WEAPONS_STORE_ITEM);
            return;
        }

        let A = 'BF';
        
        let weaponsStore = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE);
        weaponsStore.components[0].fill = ship.team.hex + '20';
        weaponsStore.components[1].fill = Helper.adjustBrightness(ship.team.hex, 0.5) + A;
        weaponsStore.components[2].value = ship.team.name + ' - Weapons Store';
        weaponsStore.components[2].position[2] = weaponsStore.components[2].value.length * 2;
        ship.sendUI(weaponsStore);

        let weaponsStoreExit = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_EXIT);
        weaponsStoreExit.components[0].fill = Helper.adjustBrightness(ship.team.hex, 0.5) + A;
        ship.sendUI(weaponsStoreExit);

        // let weaponsStoreHealing = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_HEALING);
        // weaponsStoreHealing.components[0].fill = Helper.adjustBrightness(ship.team.hex, 0.5) + A;
        // weaponsStoreHealing.components[1].value = ship.ship.healing ? '⛨ HEALING LASERS ⇌ ⚔' : '⚔ ATTACK LASERS ⇌ ⛨';
        // ship.sendUI(weaponsStoreHealing);

        let numCols = 5;
        let numRows = 2;
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                let index = i * numCols + j;
                let item = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_ITEM);
                item.id += '-' + index;
                
                let position = Helper.getGridUIPosition(27.5, 35, 1, 3, j, i, numCols, numRows);
                item.position = position;
                item.components[0].fill = ship.team.hex + A;
                item.components[1].value = DepotBaseModule.C.WEAPONS_STORE_ITEMS[index].ICON;
                item.components[2].fill = Helper.adjustBrightness(ship.team.hex, 0.5) + A;
                item.components[3].value = 'x' + DepotBaseModule.C.WEAPONS_STORE_ITEMS[index].FREQUENCY;
                item.components[4].fill = Helper.adjustBrightness(ship.team.hex, 0.5) + A;
                item.components[5].value = DepotBaseModule.C.WEAPONS_STORE_ITEMS[index].BASE_COST + ' Credits';
                item.components[6].fill = Helper.adjustBrightness(ship.team.hex, -0.5) + A;
                item.components[7].value = DepotBaseModule.C.WEAPONS_STORE_ITEMS[index].NAME;
                
                ship.sendUI(item);
            }
        }
    }

    handleTurretAutoAim() {
        for (let team of this.teams) {
            let oppTeam = this.getOppTeam(team);
            if (oppTeam && team.base) {
                for (let turretBaseModule of oppTeam.base.turretBaseModules) {
                    let closestShip = null;
                    let closestDistance = Infinity;
                    for (let ship of team.ships) {
                        let shipPos = ship.getPosition();
                        if (shipPos == null || ship.lerp || ship.ship.alive == false) continue;
                        let distance = shipPos.getDistanceTo(turretBaseModule.pose.position);
                        if (!closestShip || distance < closestDistance) {
                            closestShip = ship;
                            closestDistance = distance;
                        }
                    }
                    let laserOption = TurretBaseModule.C.LASERS[team.base.baseLevel - 1];
                    if (closestShip && closestDistance < laserOption.RANGE) {
                        turretBaseModule.isShooting = true;

                        const shipPos = closestShip.getPosition();
                        const shipVel = closestShip.getVelocity();
                        const turretPos = turretBaseModule.pose.position;
                        const laserSpeed = laserOption.SPEED;

                        const toShip = shipPos.subtract(turretPos);
                        const distance = toShip.length();

                        if (shipVel.length() < TurretBaseModule.C.MIN_VELOCITY) {
                            let turretPose = turretBaseModule.pose.clone();
                            turretPose.rotation = shipPos.getAngleTo(turretPos);
                            turretBaseModule.setPose(turretPose, true, true, TurretBaseModule.C.LERP_BLEND_FACTOR);
                        } else {
                            const timeToReach = distance / laserSpeed;
                            const predictedPos = shipPos.add(shipVel.multiply(timeToReach));
                            let turretPose = turretBaseModule.pose.clone();
                            turretPose.rotation = predictedPos.getAngleTo(turretPos);
                            turretBaseModule.setPose(turretPose, true, true, TurretBaseModule.C.LERP_BLEND_FACTOR);
                        }
                    } else {
                        turretBaseModule.isShooting = false;
                    }
                }
            }
        }
    }

    handleShipTurretUse(ship) {
        // if (ship.team) {
        //     let turretModules = ship.team.base.getModulesByType(BaseModule.C.TYPES.TURRET);
        //     for (let turretModule of turretModules) {
        //         let rectangle = turretModule.isUpper ? TurretBaseModule.C.CONTROL_RECTANGLES.UPPER : TurretBaseModule.C.CONTROL_RECTANGLES.LOWER;
        //         let controlRectangle = new Rectangle(new Vector2(rectangle.CENTER.x, rectangle.CENTER.y).rotateBy(turretModule.container.pose.rotation).add(turretModule.pose.position), new Vector2(rectangle.SIZE.x, rectangle.SIZE.y), turretModule.container.pose.rotation);
        //         let shipPosition = ship.getPosition();
        //         if (shipPosition && controlRectangle.containsPoint(shipPosition) && !ship.lerp) {
        //             turretModule.setPose(new Pose(turretModule.pose.position, ship.getPose().rotation + Math.PI, turretModule.pose.scale), true);
        //         }
        //     }
        // }
    }

    onShipSpawned(gameShip) {
        let ship = this.findShip(gameShip);
        if (ship == null) {
            ship = new Ship(gameShip);
            this.ships.push(ship);
        }
        else { // on respawn
            ship.setInvulnerable(Ship.C.INVULNERABLE_TIME)
            ship.setVelocity(new Vector2(0, 0));
            ship.fillUp();

            this.handleShipSpawnLerp(ship);
        }
    }

    onShipDestroyed(gameShip) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            ship.ship.alive = false;
        }
    }

    onUIComponentClicked(gameShip, id) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            if (id == UIComponent.C.UIS.WEAPONS_STORE_EXIT.id) {
                this.handleShipDepotExitLerp(ship);
            }
            else if (id == UIComponent.C.UIS.WEAPONS_STORE_HEALING.id) {
                ship.setHealing(!ship.ship.healing);
            }
        }
    }

    onAlienDestroyed(gameAlien, gameShip) {
        let safeAlien = this.findSafeAlien(gameAlien);
        if (safeAlien != null) {
            safeAlien.handleAlienDestroyed(gameAlien, gameShip);
        }
    }
}

class Team {
    team = 0;
    color = '';
    hex = 0;
    hue = 0;

    score = 0;

    ships = [];

    base = null;

    static C = {
        TEAMS: [
            [   
                {
                    TEAM: 0,
                    COLOR: 'Red',
                    HEX: '#ff0000',
                    NAME: 'Anarchist Concord Vega',
                    HUE: 0
                },
                {
                    TEAM: 1,
                    COLOR: 'Blue',
                    HEX: '#0000ff',
                    NAME: 'Andromeda Union',
                    HUE: 240
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Yellow',
                    HEX: '#ffff00',
                    NAME: 'Solaris Dominion',
                    HUE: 60
                },
                {
                    TEAM: 1,
                    COLOR: 'Purple',
                    HEX: '#ff00ff',
                    NAME: 'Galactic Empire',
                    HUE: 300
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Green',
                    HEX: '#00ff00',
                    NAME: 'Rebel Alliance',
                    HUE: 120
                },
                {
                    TEAM: 1,
                    COLOR: 'Orange',
                    HEX: '#ff8000',
                    NAME: 'Sovereign Trappist Colonies',
                    HUE: 30
                }
            ]
        ]
    }

    constructor(team, color, hex, name, hue) {
        this.team = team;
        this.color = color;
        this.hex = hex;
        this.name = name;
        this.hue = hue;
    }

    spawnBase() {
        this.base = new Base(this).spawnBase();
    }

    tick() {
        if (this.base) {
            this.base.tick();
        }
    }

    setScore(score) {
        this.score = score;
    }

    hasShip(ship) {
        for (let s of this.ships) {
            if (s.ship.id == ship.ship.id) {
                return true;
            }
        }
        return false;
    }

    addShip(ship) {
        if (!this.hasShip(ship)) {
            this.ships.push(ship);
        }
    }

    removeShip(ship) {
        let removeShips = [];
        for (let s of this.ships) {
            if (s.ship.id == ship.ship.id) {
                removeShips.push(s);
                break;
            }
        }
        for (let s of removeShips) {
            Helper.deleteFromArray(this.ships, s);
        }
    }
}

class ShipLerp {
    ship = null;
    
    name = '';

    startPose = null;
    targetPose = null;

    t = 0;
    
    baseModule = null;
    targetDifference = null;

    autoStop = true;
    holdFor = 0;

    duration = 0;

    running = true;

    prevTime = -1;

    static C = {
        TYPES: {
            EXIT_SPAWN: {
                NAME: 'exit-spawn',
                BLEND_FACTOR: 0.3
            },
            ENTER_DEPOT: {
                NAME: 'enter-depot',
                BLEND_FACTOR: 0.3
            },
            EXIT_DEPOT: {
                NAME: 'exit-depot',
                BLEND_FACTOR: 0.3
            }
        },
        AUTO_STOP_THRESHOLD: 5,
        AUTO_STOP_TIMEOUT: 100
    }

    constructor(ship, name, targetPose, t = 0.1, baseModule = null, autoStop = true, holdFor = 0) {
        this.ship = ship;
        this.name = name;
        this.startPose = ship.getPose();
        this.targetPose = targetPose;
        this.t = t;
        this.baseModule = baseModule;
        this.autoStop = autoStop;
        this.holdFor = holdFor;

        if (this.baseModule) {
            this.targetDifference = this.targetPose.subtract(this.baseModule.pose);
        }

        this.running = true;
        this.prevTime = game.step;
    }

    tick() {
        if (this.prevTime < 0) {
            this.prevTime = game.step;
            return;
        }
        if (this.running) {
            this.ship.setIdle(true);
            this.ship.setGenerator(0);
            this.ship.setInvulnerable(Ship.C.LERP_INVULNERABLE_TIME);
            this.ship.setCollider(false);
            this.ship.setAngle(this.targetPose.rotation);
            if (this.holdFor > 0) {
                this.holdFor -= game.step - this.prevTime;
                this.ship.setPosition(this.startPose.position);
                this.ship.setVelocity(new Vector2(0, 0));
                this.prevTime = game.step;
                return;
            }

            if (this.autoStop && (this.targetPose.subtract(this.ship.getPose()).position.length() < ShipLerp.C.AUTO_STOP_THRESHOLD || this.duration - this.holdFor > ShipLerp.C.AUTO_STOP_TIMEOUT)) {
                this.stop();
                return;
            }

            if (this.baseModule) {
                this.targetPose = this.baseModule.pose.add(this.targetDifference);
            }
            
            let lerpPose = this.ship.getPose().lerp(this.targetPose, this.t);
            let poseDifference = lerpPose.subtract(this.ship.getPose());
            if (poseDifference.position.x > game.mapSize * 5 || poseDifference.position.x < -game.mapSize * 5 ||
                poseDifference.position.y > game.mapSize * 5 || poseDifference.position.y < -game.mapSize * 5) {
                let norm = poseDifference.position.normalize();
                poseDifference.position = norm.multiply(poseDifference.position.length() - game.mapSize * 10);
            }
            let velocity = poseDifference.position.divide(game.step - this.prevTime);
            // this.ship.setPosition(lerpPose.position); // It's more clunky but more accurate
            this.ship.setVelocity(velocity);

            this.duration += game.step - this.prevTime;
            this.prevTime = game.step;
        } else {
            this.ship.setIdle(false);
            this.ship.setCollider(true);
        }
    }

    stop() {
        this.running = false;
        this.ship.setIdle(false);
        this.ship.setCollider(true);
    }
}

class Ship {    
    team = null;
    ship = null;

    timeouts = [];
    conditions = [];
    lerp = null;

    allUIs = [];
    timedUIs = [];

    inDepot = null;

    left = false;
    done = false;

    score = 0;

    isResetting = false;

    static C = {
        INVULNERABLE_TIME: 360,
        LERP_INVULNERABLE_TIME: 240,

        SHIPS: {
            '101': {
                SHIP: '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}',
                HITBOX: {
                    CENTER: {
                        x: 0,
                        y: 0
                    },
                    SIZE: {
                        x: 5,
                        y: 5
                    }
                },
            }
        }
    }

    constructor(ship) {
        this.ship = ship;
    }

    reset() {
        this.fillUp();
        this.setVelocity(new Vector2(0, 0));
        this.setCollider(true);
        this.setIdle(false);
        this.setScore(0);

        this.inDepot = null;
        this.score = 0;

        this.ship.emptyWeapons();
    }

    convertUIHexToHsla(ui) {
        for (let c of ui.components) {
            if (c.fill) {
                c.fill = Helper.hexToHsla(c.fill);
            }
            if (c.stroke) {
                c.stroke = Helper.hexToHsla(c.stroke);
            }
            if (c.color) {
                c.color = Helper.hexToHsla(c.color);
            }
        }
        return ui;
    }

    sendUI(ui, hideMode = false) {
        if (this.ship != null) {
            let cUI = this.convertUIHexToHsla(Helper.deepCopy(ui));
            let removedUIs = [];
            for (let u of this.allUIs) {
                if (u.id == cUI.id) {
                    removedUIs.push(u);
                }
            }
            if (!(removedUIs.length == 1 && Helper.areObjectsEqual(removedUIs[0], cUI))) {
                this.ship.setUIComponent(cUI);
            }

            if (!hideMode) {
                for (let u of removedUIs) {
                    Helper.deleteFromArray(this.allUIs, u);
                }
                this.allUIs.push(cUI);
            }
        }
    }

    hideUI(ui) {
        let cUI = Helper.deepCopy(ui);

        cUI.position = [0, 0, 0, 0];
        cUI.visible = false;
        cUI.clickable = false;
        cUI.components = [];

        let removedUIs = [];
        for (let u of this.allUIs) {
            if (u.id == cUI.id) {
                removedUIs.push(u);
            }
        }
        for (let u of removedUIs) {
            Helper.deleteFromArray(this.allUIs, u);
        }

        if (!(removedUIs.length == 1 && Helper.areObjectsEqual(removedUIs[0], cUI))) {
            this.sendUI(cUI, true);
        }
    }

    hideUIsIncludingID(ui) {
        let uiID = ui.id;
        let removedUIs = [];
        for (let u of this.allUIs) {
            if (u.id.includes(uiID)) {
                removedUIs.push(u);
            }
        }
        for (let u of removedUIs) {
            this.hideUI(u);
        }
    }

    sendTimedUI(ui, time = TimedUI.C.DEFAULT_TIME) {
        let removedUIs = [];
        for (let timedUI of this.timedUIs) {
            if (timedUI.ui.id == ui.id) {
                timedUI.running = false;
                removedUIs.push(timedUI);
            }
        }
        for (let timedUI of removedUIs) {
            Helper.deleteFromArray(this.timedUIs, timedUI);
        }
        let tui = new TimedUI(this, ui, time);
        this.timedUIs.push(tui);
    }

    hideAllUIs() {
        let removedUIs = [];
        for (let ui of this.allUIs) {
            removedUIs.push(ui);
        }
        for (let ui of removedUIs) {
            this.hideUI(ui);
        }
        removedUIs = [];
        for (let uiGeneric in UIComponent.C.UIS) {
            this.hideUI(UIComponent.C.UIS[uiGeneric]);
            this.hideUIsIncludingID(UIComponent.C.UIS[uiGeneric]);
        }
        this.allUIs = [];
        this.timedUIs = [];
    }

    hasUI(ui) {
        for (let u of this.allUIs) {
            if (u.id == ui.id) {
                return true;
            }
        }
        return false;
    }

    tick() {
        this.tickTimeouts();
        this.tickConditions();
        this.tickLerp();
        this.tickTimedUIs();
    }

    tickTimeouts() {
        let removeTimeouts = [];
        for (let timeout of this.timeouts) {
            if (timeout.running) {
                timeout.tick();
            } else {
                removeTimeouts.push(timeout);
            }
        }
        for (let timeout of removeTimeouts) {
            Helper.deleteFromArray(this.timeouts, timeout);
        }
    }

    tickConditions() {
        let removeConditions = [];
        for (let condition of this.conditions) {
            if (condition.running) {
                condition.tick();
            } else {
                removeConditions.push(condition);
            }
        }
        for (let condition of removeConditions) {
            Helper.deleteFromArray(this.conditions, condition);
        }
    }

    tickLerp() {
        if (this.lerp != null) {
            this.lerp.tick();
            if (!this.lerp.running) {
                this.lerp = null;
            }
        }
    }

    tickTimedUIs() {
        let removeTimedUIs = [];
        for (let timedUI of this.timedUIs) {
            if (timedUI.running) {
                timedUI.tick();
            } else {
                removeTimedUIs.push(timedUI);
            }
        }
        for (let timedUI of removeTimedUIs) {
            Helper.deleteFromArray(this.timedUIs, timedUI);
        }
    }

    getLevel() {
        return Math.trunc(this.ship.type / 100);
    }

    getModel() {
        return this.ship.type % 100;
    }

    getMaxCrystals() {
        switch (this.getLevel()) {
            case 1:
                return 20;
            case 2:
                return 80;
            case 3:
                return 180;
            case 4:
                return 360;
            case 5:
                return 500;
            case 6:
                return 720;
            case 7:
                return 980;
            default:
                return 0;
        }
    }

    setPosition(position) {
        if (game.ships.includes(this.ship)) {
            this.ship.x = position.x;
            this.ship.y = position.y;
            this.ship.set({ x: position.x, y: position.y });
        }
        return this;
    }

    getPosition() {
        if (game.ships.includes(this.ship)) {
            return new Vector2(this.ship.x, this.ship.y);
        }
        return null;
    }

    setVelocity(velocity) {
        if (game.ships.includes(this.ship)) {
            this.ship.vx = velocity.x;
            this.ship.vy = velocity.y;
            this.ship.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
    }

    getVelocity() {
        if (game.ships.includes(this.ship)) {
            return new Vector2(this.ship.vx, this.ship.vy);
        }
        return null;
    }

    setAngle(angle) {
        if (game.ships.includes(this.ship)) {
            this.ship.angle = angle;
            this.ship.set({ angle: Helper.toDegrees(angle) });
        }
        return this;
    }

    getPose() {
        if (game.ships.includes(this.ship)) {
            return new Pose(
                new Vector2(this.ship.x, this.ship.y),
                this.ship.r
            );
        }
        return null;
    }

    setCrystals(crystals) {
        if (game.ships.includes(this.ship)) {
            this.ship.crystals = crystals;
            this.ship.set({ crystals: crystals });
        }
        return this;
    }

    setShield(shield) {
        if (game.ships.includes(this.ship)) {
            this.ship.shield = shield;
            this.ship.set({ shield: shield });
        }
        return this;
    }
    
    takeDamage(damage) {
        if (this.ship.shield <= damage && this.ship.crystals <= damage) {
            this.destroySelf();
        } else if (this.ship.shield <= damage) {
            this.setShield(0);
            this.setCrystals(this.ship.crystals - damage);
        } else {
            this.setShield(this.ship.shield - damage);
        }
    }

    setStats(stats) {
        if (game.ships.includes(this.ship)) {
            this.ship.stats = stats;
            this.ship.set({ stats: stats });
        }
        return this;
    }

    setInvulnerable(invulnerable) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ invulnerable: invulnerable });
        }
        return this;
    }

    setIdle(idle) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ idle: idle });
        }
        return this;
    }

    setCollider(collider) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ collider: collider });
        }
        return this;
    }

    setGenerator(generator) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ generator: generator });
        }
        return this;
    }

    setHealing(healing) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ healing: healing });
        }
        return this;
    }

    setTeam(team) {
        this.team = team;
        this.team.addShip(this);
        if (game.ships.includes(this.ship)) {
            this.ship.team = team.team;
            this.ship.hue = team.hue;
            this.ship.set({ team: team.team, hue: team.hue });
        }
        return this;
    }

    setTeamDefault(t) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ team: t });
        }
    }

    setHue(hue) {
        if (game.ships.includes(this.ship)) {
            this.ship.hue = hue;
            this.ship.set({ hue: hue });
        }
        return this;
    }

    setScore(score) {
        this.score = score;
        if (game.ships.includes(this.ship)) {
            this.ship.score = score;
            this.ship.set({ score: score });
        }
        return this;
    }

    setType(type) {
        if (game.ships.includes(this.ship)) {
            this.ship.type = type;
            this.ship.set({ type: type });
        }
        return this;
    }

    fillUp() {
        if (game.ships.includes(this.ship)) {
            this.setMaxShield();
            this.setMaxStats();
            this.setMaxGenerator();
        }
        return this;
    }

    setMaxShield() {
        this.setShield(999999);
        return this;
    }

    setMaxStats() {
        this.setStats(99999999);
        return this;
    }

    setMaxGenerator() {
        this.setGenerator(999999);
        return this;
    }

    gameOver() {
        if (game.ships.includes(this.ship)) {
            this.ship.gameover({
                "Good game!": "Thanks for playing!",
            });
        }
        return this;
    }

    destroySelf() {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ kill: true });
        }
        return this;
    }
}

class Base {
    team = null;
    pose = null;

    baseModules = [];

    allBaseModules = [];
    containerBaseModules = [];
    alienBaseModules = [];
    spawnBaseModules = [];
    depotBaseModules = [];
    turretBaseModules = [];
    staticBaseModules = [];

    safeAliens = [];

    baseLevel = 1;
    dead = false;

    static C = {
        SCALES: [
            1,
            1.2,
            1.5,
            2
        ],
        NUM_SIDES: [
            3,
            3,
            3,
            3
        ],
        RADIUS: 80,
        ROTATION_RATE: 0, // -Math.PI / (60 * 60 * 4)
        ORBIT_RADIUS: 200,
        ORBIT_RATE: 0, // Math.PI / (60 * 60 * 4)
    };

    constructor(team) {
        this.team = team;
        let angle = (this.team.team * 2 * Math.PI) / Game.C.OPTIONS.FRIENDLY_COLORS;
        this.pose = new Pose(
            new Vector2(
                Math.cos(angle) * Base.C.ORBIT_RADIUS,
                Math.sin(angle) * Base.C.ORBIT_RADIUS
            ),
            Math.PI * this.team.team
        );
    }

    clearContainers() {
        this.baseModules = [];

        this.allBaseModules = [];
        this.containerBaseModules = [];
        this.alienBaseModules = [];
        this.spawnBaseModules = [];
        this.depotBaseModules = [];
        this.turretBaseModules = [];
        this.staticBaseModules = [];

        this.safeAliens = [];
    }

    spawnBase() {
        this.clearContainers();
        for (let i = 0; i < Base.C.NUM_SIDES[this.baseLevel - 1]; i++) {
            let angle = (i * 2 * Math.PI) / Base.C.NUM_SIDES[this.baseLevel - 1];
            let container = new ContainerBaseModule(
                this,
                new Pose(
                    new Vector2(
                        Math.cos(angle),
                        Math.sin(angle)
                    ).multiply(Base.C.RADIUS),
                    angle,
                    new Vector3(1, 1, 1).multiply(Base.C.SCALES[this.baseLevel - 1])
                ),
                [
                    new StaticBaseModule(this, new Pose(new Vector2(), Math.PI * 9/8, new Vector3(1, 1, 1).multiply(5))),
                    new AlienBaseModule(this, new Pose(new Vector2(9, -2.5), Math.PI, new Vector3(1, 1, 1).multiply(10))),
                    new SpawnBaseModule(this, new Pose(new Vector2(0, 9.5), Math.PI * -1.9 / 3, new Vector3(1, 1, 1).multiply(5)))
                ]
            );
            for (let j = 0; j < 2; j++) {
                let angle = Math.PI * 1 / 8;
                let depotPose = new Pose(
                    new Vector2(
                        -5 + Math.cos(angle + Math.PI / 2) * j * DepotBaseModule.C.STEP,
                        -6.5 + Math.sin(angle + Math.PI / 2) * j * DepotBaseModule.C.STEP
                    ),
                    angle,
                    new Vector3(1, 1, 1).multiply(5)
                );
                let depotModule = new DepotBaseModule(this, depotPose);
                container.baseModules.push(depotModule);
            }
            for (let j = 0; j < 2; j++) {
                let angle = Math.PI * 1 / 12;
                let turretPose = new Pose(
                    new Vector2(
                        1 + Math.cos(angle + Math.PI / 2) * j * TurretBaseModule.C.STEP,
                        -4 + Math.sin(angle + Math.PI / 2) * j * TurretBaseModule.C.STEP
                    ),
                    angle + Math.PI,
                    new Vector3(1, 1, 1).multiply(3.5)
                );
                let turretModule = new TurretBaseModule(this, turretPose, j == 0);
                container.baseModules.push(turretModule);
            }
            this.baseModules.push(container);
            for (let baseModule of container.baseModules) {
                baseModule.container = container;
            }
        }

        for (let baseModule of this.baseModules) {
            baseModule.spawnBaseModule();
        }
        return this;
    }

    tick() {
        this.pose.rotation += Base.C.ROTATION_RATE;
        this.pose.position = this.pose.position.rotateBy(Base.C.ORBIT_RATE);
        for (let baseModule of this.baseModules) {
            baseModule.tick();
        }
        return this;
    }

    getModulesByType(type) {
        let baseModules = [];
        for (let baseModule of this.baseModules) {
            if (baseModule.type == type) {
                baseModules.push(baseModule);
            } else if (baseModule.type == BaseModule.C.TYPES.CONTAINER) {
                let containerModules = baseModule.getModulesByType(type);
                for (let containerModule of containerModules) {
                    baseModules.push(containerModule);
                }
            }
        }
        return baseModules;
    }

    destroySelf() {
        for (let baseModule of this.baseModules) {
            baseModule.destroySelf();
        }
        for (let safeAlien of this.safeAliens) {
            safeAlien.destroySelf();
        }
        this.baseModules = [];
        this.dead = true;
        return this;
    }
}

class BaseModule {
    base = null;
    container = null;
    type = '';
    relativePose = null;
    pose = null;
    objs = [];
    dead = false;

    static C = {
        TYPES: {
            ALIEN: 'alien',
            SPAWN: 'spawn',
            DEPOT: 'depot',
            TURRET: 'turret',
            STATIC: 'static',
            CONTAINER: 'container'
        },
        RESET_MULTIPLIER: 200
    };

    constructor(base, type, relativePose) {
        this.base = base;
        this.container = base;
        this.type = type;
        this.relativePose = relativePose;

        this.base.allBaseModules.push(this);
    }

    tick() {
        this.setAbsolutePose();
        this.updateObjs();
        return this;
    }
    
    spawnBaseModule() {
        this.setAbsolutePose();
        this.createObjs();
        return this;
    }

    createObjs() {
        for (let obj of this.objs) {
            obj.destroySelf();
        }
        this.objs = [];
        return this;
    }

    updateObjs() {
        if (!this.dead) {
            for (let obj of this.objs) {
                obj.show();
                obj.setPose(this.pose);
                obj.update();
            }
        }
        if ((game.step % (Game.C.TICKS.BASE_MANAGER * BaseModule.C.RESET_MULTIPLIER)) / Game.C.TICKS.BASE_MANAGER == 0) {
            g.timeouts.push(new Timeout(() => {
                for (let obj of this.objs) {
                    obj.destroySelf();
                }
                game.removeObject();
            }, Game.C.TICKS.BASE_MANAGER - 1));
        }
    }

    createUShape() {
        let uShape = Helper.deepCopy(Obj.C.OBJS.U_SHAPE);
        uShape = this.pose.transformObj(uShape);
        let uShapeObj = new Obj(uShape.id, uShape.type, uShape.position, uShape.rotation, uShape.scale, true, true, this.base.team.hex).update();
        this.objs.push(uShapeObj);
        return this;
    }

    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.container.pose);
    }

    setPose(pose, updateImmediately = false, lerp = false, t = 0.1) {
        if (lerp) {
            pose = this.pose.lerp(pose, t);
        }
        this.relativePoseDifference = this.pose.subtract(this.relativePose);
        this.relativePose = pose.subtract(this.relativePoseDifference);
        this.setAbsolutePose();
        if (updateImmediately) {
            this.updateObjs();
        }
    }

    destroySelf() {
        this.dead = true;
        return this;
    }
}

class ContainerBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.CONTAINER;
    baseModules = [];

    constructor(base, relativePose, baseModules = []) {
        super(base, BaseModule.C.TYPES.CONTAINER, relativePose);
        this.baseModules = baseModules;
        for (let baseModule of this.baseModules) {
            baseModule.container = this;
        }

        this.base.containerBaseModules.push(this);
    }

    tick() {
        super.tick();
        for (let baseModule of this.baseModules) {
            baseModule.tick();
        }
        return this;
    }

    getModulesByType(type) {
        let baseModules = [];
        for (let baseModule of this.baseModules) {
            if (baseModule.type == type) {
                baseModules.push(baseModule);
            } else if (baseModule.type == BaseModule.C.TYPES.CONTAINER) {
                let containerModules = baseModule.getModulesByType(type);
                for (let containerModule of containerModules) {
                    baseModules.push(containerModule);
                }
            }
        }
        return baseModules;
    }

    spawnBaseModule() {
        super.spawnBaseModule();
        for (let baseModule of this.baseModules) {
            baseModule.spawnBaseModule();
        }
        return this;
    }
    
    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.container.pose);
        for (let baseModule of this.baseModules) {
            baseModule.setAbsolutePose();
        }
    }

    createObjs() {
        super.createObjs();
        for (let baseModule of this.baseModules) {
            baseModule.createObjs();
        }
        return this;
    }
}

class AlienBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.ALIEN;
    safeAlien = null;

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.ALIEN, pose);
        this.createSafeAlien();

        this.base.alienBaseModules.push(this);
    }

    createSafeAlien() {
        this.safeAlien = new SafeAlien(new Pose(new Vector2(-0.5, 0)), this);
        if (this.base) {
            this.base.safeAliens.push(this.safeAlien);
        }
    }
    
    spawnBaseModule() {
        super.spawnBaseModule();
        if (this.safeAlien) {
            this.safeAlien.spawnAlien();
        }
        return this;
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
    }

    destroySelf() {
        super.destroySelf();
        if (this.safeAlien) {
            this.safeAlien.destroySelf();
        }
        return this;
    }
}

class SpawnBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.SPAWN;

    static C = {
        SPAWN_INITIAL_OFFSET: {
            x: 5,
            y: 0
        },
        SPAWN_FINAL_OFFSET: {
            x: -10,
            y: 0
        },
        SPAWN_DELAY: 60
    }

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.SPAWN, pose);

        this.base.spawnBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
    }
}

class DepotBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.DEPOT;

    static C = {
        STEP: 8,
        SUCK_RECTANGLE: {
            CENTER: {
                x: 0,
                y: 0
            },
            SIZE: {
                x: 30,
                y: 7.5
            }
        },
        DEPOT_FINAL_OFFSET: {
            x: -10,
            y: 0
        },
        ANGLE_THRESHOLD: Math.PI / 6,
        WEAPONS_STORE_ITEMS: [
            {
                NAME: 'Rocket',
                ICON: '🚀',
                BASE_COST: 100,
                FREQUENCY: 4,
                CODE: 10
            },
            {
                NAME: 'Space Mine',
                ICON: '💣',
                BASE_COST: 100,
                FREQUENCY: 8,
                CODE: 20
            },
            {
                NAME: 'Mining Pod',
                ICON: '🔧',
                BASE_COST: 120,
                FREQUENCY: 1,
                CODE: 40
            },
            {
                NAME: 'Attack Pod',
                ICON: '⚔️',
                BASE_COST: 120,
                FREQUENCY: 1,
                CODE: 41
            },
            {
                NAME: 'Energy Refill',
                ICON: '⚡💊',
                BASE_COST: 110,
                FREQUENCY: 2,
                CODE: 90
            },
            {
                NAME: 'Shield Refill',
                ICON: '🛡️💊',
                BASE_COST: 110,
                FREQUENCY: 2,
                CODE: 91
            },
            {
                NAME: 'Defense Pod',
                ICON: '🛡️',
                BASE_COST: 120,
                FREQUENCY: 2,
                CODE: 42
            },
            {
                NAME: 'Heavy Mines',
                ICON: '💣💣',
                BASE_COST: 200,
                FREQUENCY: 4,
                CODE: 21
            },
            {
                NAME: 'Missiles',
                ICON: '🚀🚀',
                BASE_COST: 250,
                FREQUENCY: 2,
                CODE: 11
            },
            {
                NAME: 'Torpedo',
                ICON: '🚀🚀🚀',
                BASE_COST: 500,
                FREQUENCY: 1,
                CODE: 12
            }
        ]
    }

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.DEPOT, pose);

        this.base.depotBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
    }
}

class TurretBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.TURRET;
    isUpper = false;
    isShooting = false;
    lasers = [];

    shotTimeUpper = 0;
    shotTimeLower = 0;

    static C = {
        STEP: 8,
        CONTROL_RECTANGLES: {
            UPPER: {
                CENTER: {
                    x: 0,
                    y: -10
                },
                SIZE: {
                    x: 10,
                    y: 10
                }
            },
            LOWER: {
                CENTER: {
                    x: -10,
                    y: 10
                },
                SIZE: {
                    x: 10,
                    y: 10
                }
            }
        },
        OFFSETS: {
            BASE: {
                x: -1.5,
                y: 0
            },
            UPPER: {
                x: 0,
                y: -0.25
            },
            LOWER: {
                x: 0,
                y: 0.25
            }
        },
        LASERS: [
            {
                SPEED: 0.5,
                DAMAGE: 10,
                RANGE: 50,
                SHOOT_DELAY: 30
            }
        ],
        MIN_VELOCITY: 0.5,
        LERP_BLEND_FACTOR: 0.75
    }

    constructor(base, pose, isUpper = false) {
        super(base, BaseModule.C.TYPES.TURRET, pose);
        this.isUpper = isUpper;

        this.base.turretBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createTurret();
    }

    createTurret() {
        let turret = Helper.deepCopy(Obj.C.OBJS.TURRET);
        turret = this.pose.transformObj(turret);
        let turretObj = new Obj(turret.id, turret.type, turret.position, turret.rotation, turret.scale, true, true, this.base.team.hex).update();
        this.objs.push(turretObj);
        return this;
    }

    tick() {
        super.tick();
        if (this.isShooting) {
            this.shoot();
        }
        let deadLasers = [];
        for (let laser of this.lasers) {
            laser.tick();
            if (laser.dead) {
                deadLasers.push(laser);
            }
        }
        for (let laser of deadLasers) {
            Helper.deleteFromArray(this.lasers, laser);
        }
        return this;
    }

    shoot() {
        if (this.base && !this.base.dead) {
            let baseLaserPose = this.pose.add(new Pose(new Vector2(TurretBaseModule.C.OFFSETS.BASE.x, TurretBaseModule.C.OFFSETS.BASE.y).multiplyComponents(this.pose.scale).rotateBy(this.pose.rotation), Math.PI));
            let laserOption = TurretBaseModule.C.LASERS[this.base.baseLevel - 1];
            if (game.step - this.shotTimeUpper >= laserOption.SHOOT_DELAY) {
                let leftPose = baseLaserPose.add(new Pose(new Vector2(TurretBaseModule.C.OFFSETS.UPPER.x, TurretBaseModule.C.OFFSETS.UPPER.y).rotateBy(this.pose.rotation)));
                this.lasers.push(new Laser(leftPose, laserOption.SPEED, laserOption.DAMAGE, laserOption.RANGE, this.base.team).spawn());
                this.shotTimeUpper = game.step;
            }
            if (game.step - this.shotTimeLower >= laserOption.SHOOT_DELAY && game.step - this.shotTimeUpper >= laserOption.SHOOT_DELAY * 0.5) {
                let rightPose = baseLaserPose.add(new Pose(new Vector2(TurretBaseModule.C.OFFSETS.LOWER.x, TurretBaseModule.C.OFFSETS.LOWER.y).rotateBy(this.pose.rotation)));
                this.lasers.push(new Laser(rightPose, laserOption.SPEED, laserOption.DAMAGE, laserOption.RANGE, this.base.team).spawn());
                this.shotTimeLower = game.step;
            }
        }
    }

    destroySelf() {
        super.destroySelf();
        for (let laser of this.lasers) {
            laser.destroySelf();
        }
        this.lasers = [];
        return this;
    }
}

class StaticBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.STATIC; // Essentially will house all the other objects that do nothing but look pretty

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.STATIC, pose);

        this.base.staticBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createTriangle();
    }

    createTriangle() {
        let triangle = Helper.deepCopy(Obj.C.OBJS.TRIANGLE);
        triangle = this.pose.transformObj(triangle);
        let triangleObj = new Obj(triangle.id, triangle.type, triangle.position, triangle.rotation, triangle.scale, true, true, this.base.team.hex).update();
        this.objs.push(triangleObj);
        return this;
    }
}

class Laser {
    laser = null;
    initialPose = null;
    speed = null;
    damage = null;
    range = 0;
    
    team = null;

    prevTime = -1;

    dead = false;

    constructor(initialPose, speed, damage, range, team = null) {
        this.initialPose = initialPose;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.team = team;
    }

    spawn() {
        let laser = Helper.deepCopy(Obj.C.OBJS.LASER);
        laser = this.initialPose.transformObj(laser);
        this.laser = new Obj(laser.id, laser.type, laser.position, laser.rotation, laser.scale, true, true, this.team.hex).update();
        return this;
    }

    tick() {
        if (this.prevTime < 0) {
            this.prevTime = game.step;
            return;
        }

        let dt = game.step - this.prevTime;

        if (this.laser) {
            let laserPose = this.laser.getPose();
            if (laserPose.position.getDistanceTo(this.initialPose.position) >= this.range) {
                this.destroySelf();
                return;
            }
            this.laser.setPose(laserPose.add(new Pose(new Vector2(this.speed * dt, 0).rotateBy(this.laser.getPose().rotation))));
            this.laser.update();

            this.checkCollisions();
        }

        this.prevTime = game.step;
    }

    checkCollisions() {
        let oppTeam = this.team ? g.getOppTeam(this.team) : null;
        if (oppTeam) {
            for (let ship of oppTeam.ships) {
                if (ship.ship.alive) {
                    let shipPose = ship.getPose();
                    if (shipPose) {
                        let rectangle = Ship.C.SHIPS[`${ship.ship.type}`].HITBOX;
                        let shipRectangle = new Rectangle(new Vector2(rectangle.CENTER.x, rectangle.CENTER.y).rotateBy(shipPose.rotation).add(shipPose.position), new Vector2(rectangle.SIZE.x, rectangle.SIZE.y), shipPose.rotation);
                        if (shipRectangle.containsPoint(this.laser.getPose().position)) {
                            ship.takeDamage(this.damage);
                            this.destroySelf();
                            return;
                        }
                    }
                }
            }
        }
    }

    destroySelf() {
        if (this.laser) {
            this.laser.destroySelf();
        }
        this.laser = null;
        this.dead = true;
        return this;
    }
}

class SafeAlien {
    alien = null;
    relativePose = null;
    pose = null;
    baseModule = null;
    baseLevelFields = SafeAlien.C.BASE_LEVELS[0];
    setOneTimers = false;

    timeouts = [];

    static C = {
        TICKS: {
            SPAWN_DELAY: 15,
        },
        ALL: {
            VELOCITY: {
                x: 0,
                y: 0
            },
            REGEN: 0,
            DAMAGE: 1,
            LASER_SPEED: 1,
            RATE: 0.1
        },
        BASE_LEVELS: [
            {
                BASE_LEVEL: 1,
                NAME: 'Saucer',
                SHIELD: 25,
                POINTS: 10,
                CRYSTAL_DROP: 5,
                CODE: 19,
                LEVEL: 0
            },
            {
                BASE_LEVEL: 2,
                NAME: 'Saucer',
                SHIELD: 50,
                POINTS: 20,
                CRYSTAL_DROP: 10,
                CODE: 19,
                LEVEL: 1
            },
            {
                BASE_LEVEL: 3,
                NAME: 'Saucer',
                SHIELD: 100,
                POINTS: 50,
                CRYSTAL_DROP: 20,
                CODE: 19,
                LEVEL: 2
            },
            {
                BASE_LEVEL: 4,
                NAME: 'Boss',
                SHIELD: 200,
                POINTS: 100,
                CRYSTAL_DROP: 40,
                CODE: 12,
                LEVEL: 1
            }
            
        ]
    }

    constructor(relativePose, baseModule = null) {
        this.relativePose = relativePose;
        this.baseModule = baseModule;
    }

    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.baseModule.pose);
    }

    spawnAlien() {
        this.setAbsolutePose();
        if (this.pose) {
            this.baseLevelFields = this.baseModule && this.baseModule.base ? SafeAlien.C.BASE_LEVELS.find(level => level.BASE_LEVEL === this.baseModule.base.baseLevel) : SafeAlien.C.BASE_LEVELS[0];
            this.alien = new Alien(this.pose.position, new Vector2(SafeAlien.C.ALL.VELOCITY.x, SafeAlien.C.ALL.VELOCITY.y), this.baseLevelFields.NAME, this.baseLevelFields.CODE, this.baseLevelFields.LEVEL, this.baseLevelFields.POINTS, this.baseLevelFields.CRYSTAL_DROP, this.baseLevelFields.WEAPON_DROP);
            this.alien.setID(`${this.baseModule.base.team.team}-${Helper.getRandomString(10)}`);
            this.alien.setPosition(this.pose.position);
            this.setOneTimers = false;
        }
        return this;
    }

    tick() {
        this.setAbsolutePose();
        this.tickTimeouts();
        if (this.alien && game.aliens.includes(this.alien.alien)) {
            if (!this.setOneTimers) {
                this.setOneTimers = true;
                this.timeouts.push(new TimeoutCreator(() => {
                    this.alien.setShield(this.baseLevelFields.SHIELD);
                }, SafeAlien.C.TICKS.SPAWN_DELAY).start());
            }
            this.alien.setPosition(this.pose.position);
            this.alien.setVelocity(new Vector2(SafeAlien.C.ALL.VELOCITY.x, SafeAlien.C.ALL.VELOCITY.y));
            this.alien.setRegen(SafeAlien.C.ALL.REGEN);
            this.alien.setDamage(SafeAlien.C.ALL.DAMAGE);
            this.alien.setLaserSpeed(SafeAlien.C.ALL.LASER_SPEED);
            this.alien.setRate(SafeAlien.C.ALL.RATE);
        }
        return this;
    }

    tickTimeouts() {
        let removeTimeouts = [];
        for (let timeout of this.timeouts) {
            if (timeout.running) {
                timeout.tick();
            } else {
                removeTimeouts.push(timeout);
            }
        }
        for (let timeout of removeTimeouts) {
            Helper.deleteFromArray(this.timeouts, timeout);
        }
        return this;
    }

    handleAlienDestroyed(gameAlien, gameShip) {
        if (this.alien.alien == gameAlien && this.alien.alien.custom.id === gameAlien.custom.id) {
            this.alien.destroySelf();
            if (this.baseModule && !this.baseModule.dead) {
                this.spawnAlien();
            }
        }
        return this;
    }

    destroySelf() {
        if (this.alien) {
            this.alien.destroySelf();
        }
        return this;
    }
}

class Alien {
    name = '';

    alien = null;

    static C = {
        TYPES: [
            {
                NAME: 'Chicken',
                CODE: 10,
                LEVELS: [0, 1, 2],
                POINTS: [10, 20, 50],
                CRYSTAL_DROPS: [10, 20, 30],
                WEAPON_DROPS: [10, 20, 11]
            },
            {
                NAME: 'Crab',
                CODE: 11,
                LEVELS: [0, 1, 2],
                POINTS: [30, 60, 120],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [10, 20, 11]
            },
            {
                NAME: 'Caterpillar',
                CODE: 13,
                LEVELS: [0],
                POINTS: [50],
                CRYSTAL_DROPS: [10],
                WEAPON_DROPS: [11]
            },
            {
                NAME: 'Candlestick',
                CODE: 14,
                LEVELS: [0, 1, 2],
                POINTS: [80, 100, 120],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [10, 11, 12]
            },
            {
                NAME: 'Piranha',
                CODE: 16,
                LEVELS: [0, 1, 2],
                POINTS: [40, 75, 120],
                CRYSTAL_DROPS: [30, 40, 50],
                WEAPON_DROPS: [11, 21, 12]
            },
            {
                NAME: 'Pointu',
                CODE: 17,
                LEVELS: [0, 1, 2],
                POINTS: [80, 100, 150],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [11, 21, 12]
            },
            {
                NAME: 'Fork',
                CODE: 18,
                LEVELS: [0, 1, 2],
                POINTS: [100, 200, 300],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [10, 11, 12]
            },
            {
                NAME: 'Saucer',
                CODE: 19,
                LEVELS: [0, 1, 2],
                POINTS: [1000, 2500, 4000],
                CRYSTAL_DROPS: [100, 200, 300],
                WEAPON_DROPS: [21, 12, 12]
            }
        ],
        ALLOWED: [],
        MAX_AMOUNT: 0,
        SPAWN_RATE: 60
    }

    constructor(
        position, velocity,
        name, code, level,
        points, crystalDrop, weaponDrop
    ) {
        this.name = name;

        this.alien = game.addAlien({
            x: position.x, y: position.y, vx: velocity.x, vy: velocity.y,
            code: code, level: level,
            points: points, crystal_drop: crystalDrop, weapon_drop: weaponDrop,
        });
    }

    setID(id) {
        if (game.aliens.includes(this.alien)) {
            this.alien.custom.id = id;
        }
    }

    setPosition(position) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ x: position.x, y: position.y });
        }
        return this;
    }

    setVelocity(velocity) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
    }

    setShield(shield) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ shield: shield });
        }
        return this;
    }

    setRegen(regen) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ regen: regen });
        }
        return this;
    }

    setDamage(damage) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ damage: damage });
        }
        return this;
    }

    setLaserSpeed(laserSpeed) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ laser_speed: laserSpeed });
        }
        return this;
    }

    setRate(rate) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ rate: rate });
        }
        return this;
    }

    destroySelf() {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ kill: true });
        }
        return this;
    }
}

class Collectible {
    name = '';

    static C = {
        TYPES: [
            {
                NAME: '4 rockets pack',
                CODE: 10,
            },
            {
                NAME: '2 missiles pack',
                CODE: 11
            },
            {
                NAME: '1 torpedo',
                CODE: 12
            },
            {
                NAME: '8 light mines pack',
                CODE: 20
            },
            {
                NAME: '4 heavy mines pack',
                CODE: 21
            },
            {
                NAME: 'Mining pod',
                CODE: 40
            },
            {
                NAME: 'Attack pod',
                CODE: 41
            },
            {
                NAME: 'Defence pod',
                CODE: 42
            },
            {
                NAME: 'Energy refill',
                CODE: 90
            },
            {
                NAME: 'Shield refill',
                CODE: 91
            }
        ],
        ALLOWED: [10, 11, 90, 91],
        MAX_AMOUNT: 10,
        SPAWN_RATE: 1800
    }

    constructor(
        position,
        name,
        code
    ) {
        this.name = name;

        game.addCollectible({
            x: position.x, y: position.y,
            code: code
        });
    }
}

class AsteroidPath {
    asteroid = null;
    initialPos = null;
    velocity = null;
    size = 1;

    initTime = -1;

    constructor(initialPos, velocity, size) {
        this.initialPos = initialPos;
        this.velocity = velocity;
        this.size = size;
    }

    spawn() {
        this.asteroid = new Asteroid(this.initialPos, this.velocity, this.size);
        this.initTime = game.step;
        return this;
    }

    tick() {
        if (this.initTime != -1) {
            let astPos = this.initialPos.clone().add(this.velocity.clone().multiply(game.step - this.initTime));
            this.asteroid.setPosition(new Vector2(astPos.x % (Game.C.OPTIONS.MAP_SIZE * 10), astPos.y % (Game.C.OPTIONS.MAP_SIZE * 10)));
            this.asteroid.setVelocity(this.velocity);
        }
        return this;
    }

    stop() {
        this.initTime = -1;
        return this;
    }

    destroySelf() {
        this.asteroid.destroySelfNoRemains();
        return this;
    }
}

class Asteroid {
    asteroid = null;

    constructor(position, velocity, size) {
        this.asteroid = game.addAsteroid({
            x: position.x, y: position.y, vx: velocity.x, vy: velocity.y,
            size: size
        });
    }

    setPosition(position) {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ x: position.x, y: position.y });
        }
        return this;
    }

    setVelocity(velocity) {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
    }

    setSize(size) {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ size: size });
        }
        return this;
    }

    destroySelf() {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ kill: true });
        }
        return this;
    }

    destroySelfNoRemains() {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ size: 1, kill: true });
        }
        return this;
    }
}

class TimedAsteroid {
    asteroid = null;
    time = 0;

    spawnTime = -1;
    running = false;

    constructor(asteroid, time) {
        this.asteroid = asteroid;
        this.time = time;
        this.spawnTime = game.step;
        this.running = true;
    }

    tick() {
        if (this.running) {
            if (game.step - this.spawnTime >= this.time) {
                this.asteroid.destroySelfNoRemains();
                this.running = false;
            }
        }
        return this;
    }

    destroySelf() {
        this.asteroid.destroySelfNoRemains();
    }
}

class Obj {
    originalObj = null;
    prevObj = null;
    obj = null;

    static C = {
        GHOST_SUFFIX: '-ghost',
        OBJS: {
            PLANE: {
                id: 'plane',
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 0
                },
                type: {
                    id: 'plane',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: '',
                }
            },
            GRID: {
                id: 'grid',
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 10,
                    y: 10,
                    z: 0
                },
                type: {
                    id: 'grid',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/grid.png'
                }
            },
            U_SHAPE: {
                id: 'u_shape',
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                type: {
                    id: 'u_shape',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/u_shape.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    physics: {
                        mass: 500,
                        shape: [0,0,0,1.412,1.329,1.13,1.003,0.918,0.855,0.812,0.783,0.771,0.78,0.806,0.813,0.832,0.867,0.901,0.881,0.909,1.008,0,0,0,0,0,0,0,0,0,1.008,0.909,0.881,0.901,0.867,0.832,0.813,0.806,0.78,0.771,0.783,0.812,0.855,0.918,1.003,1.13,1.329,1.412,0,0]
                    } // WHEN CREATING A NEW OBJECT, PUT PHYSICS AS {}, THEN THE SHAPE WILL BE PRINTED IN CONSOLE
                },
            },
            TRIANGLE: {
                id: 'triangle',
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                type: {
                    id: 'triangle',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/triangle.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    physics: {
                        mass: 500,
                        shape: [0.921,0.873,0.843,0.828,0.834,0.859,0.9,0.957,1.048,1.171,1.354,1.633,1.963,1.935,1.767,1.853,1.911,1.711,1.398,1.197,1.069,0.976,0.908,0.865,0.839,0.827,0.839,0.865,0.908,0.976,1.069,1.197,1.398,1.711,1.911,1.853,1.767,2.08,2.026,1.812,1.664,1.561,1.492,1.45,1.434,1.185,1.278,1.236,1.091,0.99]
                    }
                }
            },
            TURRET: {
                id: 'turret',
                position: {
                    x: 0,
                    y: 0,
                    z: 4
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                type: {
                    id: 'turret',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/turret.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    // physics: {
                    //     mass: 500,
                    //     shape: [1.553,1.556,0.816,0.517,0.479,0.378,0.32,0.296,0.285,0.279,0.28,0.313,0.999,1.008,1.031,1.075,1.14,1.166,1.106,0.949,0.844,0.665,0.85,0.846,0.842,0.85,0.842,0.846,0.85,0.665,0.534,0.3,0.296,0.285,0.279,0.28,0.287,0.299,0.3,0.287,0.28,0.279,0.285,0.296,0.32,0.378,0.479,0.517,0.816,1.556]
                    // }
                }
            },
            LASER: {
                id: 'laser',
                position: {
                    x: 0,
                    y: 0,
                    z: 6
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 0.25,
                    y: 0.1,
                    z: 0.1
                },
                type: {
                    id: 'laser',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/laser.obj',
                    transparent: false
                }
            }
        }
    }

    constructor(
        id,
        type,
        position, rotation, scale,
        randomizeID = false,
        randomizeTypeID = false,
        color = "#ffffff"
    ) {
        this.obj = {
            id: id,
            type: this.convertTypeHexToHsla(Helper.deepCopy(type)),
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z
            },
            scale: {
                x: scale.x,
                y: scale.y,
                z: scale.z
            }
        };

        if (color) {
            this.obj.type.emissiveColor = color;
        }
        if (randomizeID) {
            this.obj.id += '-' + Helper.getRandomString(10);
        }
        if (randomizeTypeID) {
            this.obj.type.id += '-' + Helper.getRandomString(10);
        }

        this.originalObj = Helper.deepCopy(this.obj);
    }

    convertTypeHexToHsla(type) {
        if (type.diffuseColor) {
            type.diffuseColor = Helper.hexToHsla(type.diffuseColor);
        }
        if (type.emissiveColor) {
            type.emissiveColor = Helper.hexToHsla(type.emissiveColor);
        }
        return type;
    }

    update() {
        if (JSON.stringify(this.obj) == JSON.stringify(this.prevObj)) {
            return;
        }
        game.setObject(this.obj);
        this.prevObj = Helper.deepCopy(this.obj);
        return this;
    }

    reset() {
        this.obj = Helper.deepCopy(this.originalObj);
        this.update();
        return this;
    }

    setPose(pose) {
        this.obj.position = {
            x: pose.position.x,
            y: pose.position.y,
            z: this.obj.position.z
        };
        this.obj.rotation = {
            x: this.obj.rotation.x,
            y: this.obj.rotation.y,
            z: pose.rotation
        };
        this.obj.scale = {
            x: pose.scale.x,
            y: pose.scale.y,
            z: pose.scale.z
        };
        return this;
    }

    getPose() {
        return new Pose(
            new Vector2(this.obj.position.x, this.obj.position.y),
            this.obj.rotation.z,
            new Vector3(this.obj.scale.x, this.obj.scale.y, this.obj.scale.z)
        );
    }

    setPosition(position) {
        this.obj.position = {
            x: position.x,
            y: position.y,
            z: position.z
        };
        return this;
    }

    setRotation(rotation) {
        this.obj.rotation = {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z
        };
        return this;
    }

    setScale(scale) {
        this.obj.scale = {
            x: scale.x,
            y: scale.y,
            z: scale.z
        };
        return this;
    }

    hide() {
        this.obj.position.z = -1e5;
        this.obj.scale.x *= 1e-5;
        this.obj.scale.y *= 1e-5;
        this.obj.scale.z *= 1e-5;
        this.update();
    }

    show() {
        this.obj.position.z = this.originalObj.position.z;
        this.obj.scale.x = this.originalObj.scale.x;
        this.obj.scale.y = this.originalObj.scale.y;
        this.obj.scale.z = this.originalObj.scale.z;
        this.update();
    }

    destroySelf() {
        this.hide();
        game.removeObject(this.obj.id);
    }
}

class TimedObj {
    obj = null;
    time = 0;

    spawnTime = 0;
    running = false;

    constructor(obj, time) {
        this.obj = obj;
        this.time = time;
    }

    spawn() {
        this.spawnTime = game.step;
        this.running = true;
        this.obj.update();
        return this;
    }

    tick() {
        if (this.running) {
            if (game.step - this.spawnTime >= this.time) {
                this.obj.destroySelf();
                this.running = false;
            }
        }
        return this;
    }

    destroySelf() {
        this.obj.destroySelf();
    }
}

class ObjectType {
    objectType = null;

    constructor(
        id,
        obj,
        diffuse, emissive, specular, bump,
        diffuseColor, emissiveColor,
        transparent,
        bumpScale,
        physics
    ) {
        this.objectType = {
            id: id,
            obj: obj,
            diffuse: diffuse, emissive: emissive, specular: specular, bump: bump,
            diffuseColor: diffuseColor, emissiveColor: emissiveColor,
            transparent: transparent,
            bumpScale: bumpScale,
            physics: physics
        };
    }
}

class ObjectPhysics {
    objectPhysics = null;

    constructor(
        mass,
        shape
    ) {
        this.objectPhysics = {
            mass: mass,
            shape: shape
        };
    }
}

class TimedUI {
    startTime = 0;
    running = false;

    ship = null;
    ui = null;

    static C = {
        DEFAULT_TIME: 300,
        LOGO_TIME: 480
    }

    constructor(ship, ui, time = TimedUI.C.DEFAULT_TIME) {
        this.ship = ship;
        this.ui = ui;
        this.time = time;
        this.startTime = game.step;

        this.running = true;

        this.ship.sendUI(this.ui);
    }

    tick() {
        if (this.running) {
            if (game.step - this.startTime >= this.time) {
                this.ship.hideUI(this.ui);
                this.running = false;
            }
        }
    }
}

class UIComponent {
    uiComponent = null;

    static C = {
        UIS: {
            SCOREBOARD: {
                id: 'scoreboard',
                visible: true,
                components: [

                ],
                START: 8,
                HEIGHT: 6.5
            },
            RADAR_BACKGROUND: {
                id: 'radar_background',
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 0, 0]
                    }
                ]
            },
            LIVES_BLOCKER: {
                id: "lives_blocker",
                visible: true,
                clickable: true,
                shortcut: String.fromCharCode(187),
                position: [65, 0, 10, 10],
                components: []
            },
            TOP_MESSAGE: {
                id: "top_message",
                position: [0, 0, 100, 5],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#00000080',
                    },
                    {
                        type: "text",
                        position: [10, 10, 80, 80],
                        value: '',
                        color: '#ffffff'
                    }
                ]
            },
            BOTTOM_MESSAGE: {
                id: "bottom_message",
                position: [0, 95, 100, 5],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#00000080',
                    },
                    {
                        type: "text",
                        position: [10, 10, 80, 80],
                        value: '',
                        color: '#ffffff'
                    }
                ]
            },
            NOTIFICATION: {
                id: "notification",
                position: [5, 75, 60, 10],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 0, 100],
                        width: 10
                    },
                    {
                        type: "text",
                        position: [2.5, 5, 90, 50],
                        align: "left",
                        color: '#ffffff'
                    },
                    {
                        type: "text",
                        position: [2.5, 52.5, 60, 42.5],
                        align: "left",
                        color: '#ffffffaa'
                    }
                ]
            },
            MIDDLE_MESSAGE: {
                id: "middle_message",
                position: [20, 47.5, 40, 5],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 0],
                        stroke: '#ffffff',
                        width: 4
                    },
                    {
                        type: 'box',
                        position: [0, 100, 100, 0],
                        stroke: '#ffffff',
                        width: 4
                    },
                    {
                        type: "text",
                        position: [10, 10, 80, 80],
                        color: '#ffffff'
                    }
                ]
            },
            WEAPONS_STORE: {
                id: "weapons_store",
                position: [25, 25, 50, 60],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100]
                    },
                    {
                        type: 'box',
                        position: [0, 0, 100, 10],
                    },
                    {
                        type: "text",
                        position: [2.5, 0, 20, 10],
                        color: '#000000'
                    },
                    {
                        type: "text",
                        position: [0, 80, 100, 10],
                        value: 'CONTRIB SECTION TODO',
                        color: '#ffffff'
                    },
                ]
            },
            WEAPONS_STORE_EXIT: {
                id: "weapons_store_exit",
                position: [65, 80, 10, 5],
                visible: true,
                clickable: true,
                shortcut: String.fromCharCode(27), // ESC
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                    },
                    {
                        type: "text",
                        position: [20, 20, 60, 60],
                        value: 'EXIT',
                        color: '#000000'
                    }
                ]
            },
            WEAPONS_STORE_HEALING: {
                id: "weapons_store_healing",
                position: [25, 80, 20, 5],
                visible: true,
                clickable: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                    },
                    {
                        type: "text",
                        position: [5, 5, 90, 90],
                        color: '#000000'
                    }
                ]
            },
            WEAPONS_STORE_ITEM: {
                id: "weapons_store_item",
                position: [0, 0, 10, 10],
                visible: true,
                clickable: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100]
                    },
                    {
                        type: "text",
                        position: [25, 5, 70, 40],
                        color: '#ffffff',
                        align: 'right'
                    },
                    {
                        type: 'box',
                        position: [0, 0, 20, 20]
                    },
                    {
                        type: "text",
                        position: [2.5, 2.5, 15, 15],
                        color: '#000000',
                    },
                    {
                        type: 'box',
                        position: [0, 50, 100, 20]
                    },
                    {
                        type: "text",
                        position: [2.5, 52.5, 95, 15],
                        color: '#000000',
                    },
                    {
                        type: 'box',
                        position: [0, 70, 100, 30]
                    },
                    {
                        type: "text",
                        position: [10, 75, 80, 20],
                        color: '#ffffff',
                    },
                ]
            }
        },
        TICKS: {

        }
    }

    constructor(
        id,
        position,
        visible,
        clickable, shortcut,
        components
    ) {
        this.uiComponent = {
            id: id,
            position: position,
            visible: visible,
            clickable: clickable, shortcut: shortcut,
            components: components
        };
        game.setUIComponent(this.uiComponent);
    }

    setPosition(position) {
        this.uiComponent.position = position;
        return this;
    }

    setVisible(visible) {
        this.uiComponent.visible = visible;
        return this;
    }

    setClickable(clickable) {
        this.uiComponent.clickable = clickable;
        return this;
    }

    setShortcut(shortcut) {
        this.uiComponent.shortcut = shortcut;
        return this;
    }

    setComponents(components) {
        this.uiComponent.components = components;
        return this;
    }

    addComponent(component) {
        this.uiComponent.components.push(component);
        return this;
    }

    removeComponent(component) {
        Helper.deleteFromArray(this.uiComponent.components, component);
        return this;
    }

    destroySelf() {
        this.uiComponent.visible = false;
        this.uiComponent.position = [0, 0, 0, 0];
        game.setUIComponent(this.uiComponent);
    }
}

class UISubComponent {
    uiSubComponent = null;

    constructor(
        type,
        id, // player id for badge
        position,
        value,
        color,
        fill,
        width,
        stroke,
        align
    ) {
        this.uiSubComponent = {
            type: type,
            id: id,
            position: position,
            value: value,
            color: color,
            fill: fill,
            width: width,
            stroke: stroke,
            align: align
        };
    }

    setId(id) {
        this.uiSubComponent.id = id;
        return this;
    }

    setPosition(position) {
        this.uiSubComponent.position = position;
        return this;
    }

    setValue(value) {
        this.uiSubComponent.value = value;
        return this;
    }

    setColor(color) {
        this.uiSubComponent.color = color;
        return this;
    }

    setFill(fill) {
        this.uiSubComponent.fill = fill;
        return this;
    }

    setWidth(width) {
        this.uiSubComponent.width = width;
        return this;
    }

    setStroke(stroke) {
        this.uiSubComponent.stroke = stroke;
        return this;
    }

    setAlign(align) {
        this.uiSubComponent.align = align;
        return this;
    }
}

class Rectangle {
    center = null;
    size = null;
    angle = 0;

    constructor(center = new Vector2(0, 0), size = new Vector2(1, 1), angle = 0) {
        this.center = center;
        this.size = size;
        this.angle = angle;
    }

    getVertices() {
        const halfWidth = this.size.x / 2;
        const halfHeight = this.size.y / 2;

        const vertices = [
            new Vector2(-halfWidth, -halfHeight),
            new Vector2(halfWidth, -halfHeight),
            new Vector2(halfWidth, halfHeight),
            new Vector2(-halfWidth, halfHeight)
        ];

        return vertices.map(vertex => vertex.rotateBy(this.angle).add(this.center));
    }

    containsPoint(point) {
        const localPoint = point.subtract(this.center).rotateBy(-this.angle);

        const halfWidth = this.size.x / 2;
        const halfHeight = this.size.y / 2;

        return (
            localPoint.x >= -halfWidth && localPoint.x <= halfWidth &&
            localPoint.y >= -halfHeight && localPoint.y <= halfHeight
        );
    }
}

class Pose {
    position = null;
    rotation = null;
    scale = null;

    constructor(position = new Vector2(0, 0), rotation = 0, scale = new Vector3(1, 1, 1)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    getAbsolutePose(prevPose) {
        const rotatedPosition = this.position.rotateBy(prevPose.rotation);
        const scaledPosition = new Vector2(
            rotatedPosition.x * prevPose.scale.x,
            rotatedPosition.y * prevPose.scale.y
        );
        const absolutePosition = prevPose.position.add(scaledPosition);
        const absoluteRotation = prevPose.rotation + this.rotation;
        const absoluteScale = prevPose.scale.multiplyComponents(this.scale);
        return new Pose(absolutePosition, absoluteRotation, absoluteScale);
    }

    rotateBy(angle) {
        const newPosition = this.position.clone().rotateBy(angle);
        const newRotation = this.rotation + angle;
        return new Pose(newPosition, newRotation, this.scale.clone());
    }

    transformObj(obj) {
        let objPosition = new Vector2(obj.position.x, obj.position.y);
        let transformedPosition = this.position.add(objPosition.rotateBy(this.rotation));
        
        obj.position.x += transformedPosition.x;
        obj.position.y += transformedPosition.y;

        obj.rotation.z += this.rotation + obj.rotation.z;
        
        obj.scale.x *= this.scale.x;
        obj.scale.y *= this.scale.y;
        obj.scale.z *= this.scale.z;
        return obj;
    }

    add(pose) {
        const newPosition = this.position.add(pose.position);
        const newRotation = this.rotation + pose.rotation;
        const newScale = this.scale.multiplyComponents(pose.scale);
        return new Pose(newPosition, newRotation, newScale);
    }

    subtract(pose) {
        const newPosition = this.position.subtract(pose.position);
        const newRotation = this.rotation - pose.rotation;
        const newScale = this.scale.divideComponents(pose.scale);
        return new Pose(newPosition, newRotation, newScale);
    }

    lerpRotation(rotation, t) {
        let a = ((this.rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        let b = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        let delta = b - a;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        let newRotation = a + delta * t;
        newRotation = ((newRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        return new Pose(this.position.clone(), newRotation, this.scale.clone());
    }

    lerp(pose, t) {
        const newPosition = this.position.lerp(pose.position, t);
        const newRotation = this.lerpRotation(pose.rotation, t).rotation;
        const newScale = this.scale.lerp(pose.scale, t);
        return new Pose(newPosition, newRotation, newScale);
    }

    clone() {
        return new Pose(
            this.position.clone(),
            this.rotation,
            this.scale.clone()
        );
    }
}

class Vector2 {
    x = 0;
    y = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    multiplyComponents(vector) {
        return new Vector2(this.x * vector.x, this.y * vector.y);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    divideComponents(vector) {
        return new Vector2(this.x / vector.x, this.y / vector.y);
    }

    addScalar(scalar) {
        return new Vector2(this.x + scalar, this.y + scalar);
    }

    subtractScalar(scalar) {
        return new Vector2(this.x - scalar, this.y - scalar);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        return this.divide(this.length());
    }

    getDistanceTo(vector) {
        return Math.sqrt(this.getDistanceSquaredTo(vector));
    }

    getDistanceSquaredTo(vector) {
        const dx = vector.x - this.x;
        const dy = vector.y - this.y;
        return dx * dx + dy * dy;
    }

    getAngleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    rotateBy(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    lerp(vector, t, ease = true) {
        if (ease) t = Helper.getCubicEaseInOut(t);
        return new Vector2(
            this.x + (vector.x - this.x) * t,
            this.y + (vector.y - this.y) * t
        );
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
    }
}

class Vector3 {
    x = 0;
    y = 0;
    z = 0;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vector) {
        return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }

    subtract(vector) {
        return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    multiplyComponents(vector) {
        return new Vector3(this.x * vector.x, this.y * vector.y, this.z * vector.z);
    }

    divide(scalar) {
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    divideComponents(vector) {
        return new Vector3(this.x / vector.x, this.y / vector.y, this.z / vector.z);
    }

    addScalar(scalar) {
        return new Vector3(this.x + scalar, this.y + scalar, this.z + scalar);
    }

    subtractScalar(scalar) {
        return new Vector3(this.x - scalar, this.y - scalar, this.z - scalar);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }

    cross(vector) {
        return new Vector3(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        );
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize() {
        return this.divide(this.length());
    }

    getDistanceTo(vector) {
        return this.subtract(vector).length();
    }

    getDistanceSquaredTo(vector) {
        return this.subtract(vector).lengthSquared();
    }

    getAngleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    lerp(vector, t, ease = true) {
        if (ease) t = Helper.getCubicEaseInOut(t);
        return new Vector3(
            this.x + (vector.x - this.x) * t,
            this.y + (vector.y - this.y) * t,
            this.z + (vector.z - this.z) * t
        );
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y && this.z === vector.z;
    }
}

class TimeoutCreator {
    startTime = 0;
    duration = 0;
    callback = null;
    running = false;

    constructor(callback, duration) {
        this.callback = callback;
        this.duration = duration;
    }

    start() {
        this.startTime = game.step;
        this.running = true;
        return this;
    }

    tick() {
        if (this.running) {
            if (game.step - this.startTime >= this.duration) {
                this.callback();
                this.running = false;
            }
        }
        return this;
    }
}

class ConditionCreator {
    condition = null;
    callback = null;
    running = false;

    constructor(condition, callback) {
        this.condition = condition;
        this.callback = callback;
    }

    start() {
        this.running = true;
        return this;
    }

    tick() {
        if (this.running) {
            if (this.condition()) {
                this.callback();
                this.running = false;
            }
        }
        return this;
    }
}

class Helper {
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.getRandomInt(0, i);
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static getRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    static getRandomHue() {
        return this.getRandomInt(0, 360);
    }

    static getRandomHex() {
        return "#" + Math.floor(Math.random()*16777215).toString(16);
    }

    static getRandomVividHSL(alpha = 100) {
        let hue = Math.floor(Math.random() * 361);
        let saturation = 100;
        let lightness = Math.floor(Math.random() * 21) + 40;
        
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    static hexToHsla(hex, returnObject = false) {
        hex = hex.replace(/^#/, '');
    
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
    
        let r = parseInt(hex.substring(0, 2), 16) / 255;
        let g = parseInt(hex.substring(2, 4), 16) / 255;
        let b = parseInt(hex.substring(4, 6), 16) / 255;
        let a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
    
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
    
        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
    
            h = Math.round(h * 60);
        }
    
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        if (returnObject) {
            return { h, s, l, a };
        }

        return `hsla(${h}, ${s}%, ${l}%, ${parseFloat(a.toFixed(2))})`;
    }

    static hslaToHex(h, s, l, a = 1) {
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        
        let r, g, b;

        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        let hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

        if (a < 1) {
            let alphaHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
            hex += alphaHex;
        }

        return hex;
    }

    static adjustSaturation(hex, percent) {
        let { h, s, l, a } = Helper.hexToHsla(hex, true);
        s = Math.min(100, Math.max(0, s + percent * 100));
        return Helper.hslaToHex(h, s, l, a);
    }


    static adjustBrightness(hex, percent) {
        hex = hex.replace(/^#/, '');

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        if (percent > 0) {
            r += (255 - r) * percent;
            g += (255 - g) * percent;
            b += (255 - b) * percent;
        } else {
            r *= 1 + percent;
            g *= 1 + percent;
            b *= 1 + percent;
        }

        r = Math.round(Math.min(255, Math.max(0, r)));
        g = Math.round(Math.min(255, Math.max(0, g)));
        b = Math.round(Math.min(255, Math.max(0, b)));

        return (
            '#' +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0')
        ).toUpperCase();
    }


    static getRandomRectCoordinate(min, max) {
        return new Vector2(
            this.getRandomInt(min.x, max.x),
            this.getRandomInt(min.y, max.y)
        );
    }

    static getRandomRadialCoordinate(radius, center) {
        // https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
        let r = radius * Math.sqrt(Math.random());
        let theta = this.getRandomAngle();
        return new Vector2(
            center.x + r * Math.cos(theta),
            center.y + r * Math.sin(theta)
        );
    }

    static getRandomMapCoordinate() {
        return Helper.getRandomRectCoordinate(
            new Vector2(-Game.C.OPTIONS.MAP_SIZE / 2 * 10, -Game.C.OPTIONS.MAP_SIZE / 2 * 10),
            new Vector2(Game.C.OPTIONS.MAP_SIZE / 2 * 10, Game.C.OPTIONS.MAP_SIZE / 2 * 10)
        );
    }

    static getRandomAngle() {
        return Math.random() * 2 * Math.PI;
    }

    static getRandomArrayElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static getRandomArraySubset(array, size) {
        let subset = [];
        let usedIndices = new Set();
        while (subset.length < size) {
            let element = this.getRandomArrayElement(array);
            if (!usedIndices.has(element)) {
                subset.push(element);
                usedIndices.add(element);
            }
        }
        return subset;
    }

    static getCubicEaseInOut(t) {
        if (t < 0.5) {
            return 4 * t * t * t;
        } else {
            return 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    }

    static angleWithinThreshold(angle, target, threshold) {
        let diff = Math.abs(angle - target) % (2 * Math.PI);
        return diff <= threshold || diff >= 2 * Math.PI - threshold;
    }

    static getNGonCorners(n, angleOffset=0) {
        let corners = [];
        for (let i = 0; i < n; i++) {
            let angle = i * 2 * Math.PI / n + angleOffset;
            corners.push(new Vector2(Math.cos(angle), Math.sin(angle)));
        }
        return corners;
    }
    static toDegrees(radians) {
        let deg = radians * (180 / Math.PI);
        deg = ((deg % 360) + 360) % 360;
        return deg;
    }

    static toRadians(degrees) {
        degrees = ((degrees % 360) + 360) % 360;
        return degrees * (Math.PI / 180);
    }

    static formatTime(time) {
        if (time < 0) {
            time = 0;
        }
        let minutes = 0;
        let seconds = Math.floor(time / 60);
        minutes = Math.floor(seconds / 60);
        seconds %= 60;
        return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
    }

    static deepCopy(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static areObjectsEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    static deleteFromArray(array, element) {
        let index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    static getRadarSpotPosition(xy, wh) {
        let x = xy.x;
        let y = xy.y;
        let w = wh.x;
        let h = wh.y;
        let scalePos = 10 / Game.C.OPTIONS.MAP_SIZE;
        let scaleSize = 10 / Game.C.OPTIONS.MAP_SIZE;
        return [
            50 + x * scalePos - w * scaleSize / 2,
            50 - y * scalePos - h * scaleSize / 2,
            w * scaleSize,
            h * scaleSize
        ];
    }

    static getGridUIPosition(startX, startY, separationX, separationY, indexX, indexY, numX, numY) {
        let totalAvailableWidth = (100 - startX * 2) - (numX - 1) * separationX;
        let totalAvailableHeight = (100 - startY * 2) - (numY - 1) * separationY;

        let width = totalAvailableWidth / numX;
        let height = totalAvailableHeight / numY;

        let x = startX + indexX * (width + separationX);
        let y = startY + indexY * (height + separationY);

        return [x, y, width, height];
    }
}

this.options = {
    root_mode: Game.C.OPTIONS.ROOT_MODE,
    map_size: Game.C.OPTIONS.MAP_SIZE,
    custom_map: Game.C.OPTIONS.MAP,
    asteroids_strength: Game.C.OPTIONS.ASTEROIDS_STRENGTH,
    release_crystal: Game.C.OPTIONS.RELEASE_CRYSTAL,
    crystal_drop: Game.C.OPTIONS.CRYSTAL_DROP,
    crystal_value: Game.C.OPTIONS.CRYSTAL_VALUE,

    friendly_colors: Game.C.OPTIONS.FRIENDLY_COLORS,

    radar_zoom: Game.C.OPTIONS.RADAR_ZOOM,

    speed_mod: Game.C.OPTIONS.SPEED_MOD,
    friction_ratio: Game.C.OPTIONS.FRICTION_RATIO,

    weapons_store: Game.C.OPTIONS.WEAPONS_STORE,
    projectile_speed: Game.C.OPTIONS.PROJECTILE_SPEED,

    starting_ship: Game.C.OPTIONS.STARTING_SHIP,
    reset_tree: Game.C.OPTIONS.RESET_TREE,
    choose_ship: Game.C.OPTIONS.CHOOSE_SHIP,
    ships: Game.C.OPTIONS.SHIPS,
    max_players: Game.C.OPTIONS.MAX_PLAYERS,

    vocabulary: Game.C.OPTIONS.VOCABULARY
}

let g = null;

this.tick = function () {
    if (g == null) {
        g = new Game();
    }
    if (g != null) {
        // This overwrites the `this.tick` function with just `g.tick();`
        (this.tick = function () {
            g.tick();
        })();

        game.custom.kick = function (shipID) {
            game.findShip(shipID).gameover ({ "": "" });
        };

        game.custom.showIDs = function () {
            let list = "PLAYER LIST:\n";
            for (let ship of game.ships) {
                list += `${ship.id}: ${ship.name}\n`;
            }
            return list;
        }
    }
};

this.event = function (event) {
    let gameShip = event.ship;
    if (gameShip != null && g != null) {
        switch (event.name) {
            case 'ship_spawned':
                g.onShipSpawned(gameShip);
                echo(game.custom.showIDs());
                break;
            case 'ship_destroyed':
                g.onShipDestroyed(gameShip);
                echo(game.custom.showIDs());
                break;
            case 'ui_component_clicked':
                g.onUIComponentClicked(gameShip, event.id);
                break;
        }
    }

    let gameAlien = event.alien;
    if (gameAlien != null && g != null) {
        switch (event.name) {
            case 'alien_destroyed':
                g.onAlienDestroyed(gameAlien, event.killer);
                break;
        }
    }
}

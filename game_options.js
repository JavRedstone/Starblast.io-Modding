// All options -----

// All root modes. Default value is the last element in the array: "".
const root_mode = ["survival", "team", "invasion", "deathmatch", "battleroyale", ""];
// Options for reset tree. Default value is: false.
const reset_tree = [true, false];
// Default map size correlated to the root modes, in the same order. It is an integer
// between 20 and 200 and can be specified, but these are the default numbers.
const map_size = [100, 80, 30, 20, 80, 60];
// Default soundtracks correlated to the root modes, in the same order. It can be
// specified otherwise.
const soundtrack_default = ["procedurality.mp3", "procedurality.mp3", "crystals.mp3", "crystals.mp3", "argon.mp3"];
// All soundtracks
const soundtrack = ["procedurality.mp3", "argon.mp3", "crystals.mp3", "red_mist.mp3", "civilisation.mp3", "warp_drive.mp3", ""];
// Default max players correlated to the root modes, in the same order. It is an integer
// between 1 and 240 and can be specified, but these are the default numbers.
const max_players = [60, 70, 6, 20, 30, 40];
// Default crystal value correlated to the root modes, in the same order. It is a float
// between 0 and 10 and can be specified, but these are the default numbers.
const crystal_value = [1, 2, 1, 0, 0, 1];
// Default lives when reached max tier correlated to the root modes, in the same 
// order. It can be specified, but these are thedefault numbers.
const maxtierlives = [3, 0, 3, 0, 1, 3];
// Default max level. Integer from 1 to 7.
const max_level = 7;
// Number of teams: Float from 0 to 5.
const friendly_colors = [0, 3, 1, 0, 0, 0];
// Name of the map is either auto-generated, or specified
const map_name = "";
// Default survival level correlated to the root modes, in the same order. It is an
// integer between 2 and 8 and can be specified (8 means no trigger), but these are
// the default numbers.
const survival_level = [7, 8, 8, 8, 8, 8];
// Default starting ship. Enter the ship code: eg. 101, 201, 202, 301, etc.
const starting_ship = 101;
// Options for starting ship maxed. Default is: false.
const starting_ship_maxed = [true, false];
// Default asteroid strength correlated to the root modes, in the same order. It is
// an integer between 0 and 10000 and can be specified, but these are the default numbers.
const asteroids_strength = [1, 1, 1, 5, 0.5, 1];
// Friction ratio: Float from 0 to 2.
const friction_ratio = 1;
// Strafing speed ratio: Integer from 0 to 1.
const strafe = 0;
// Default speed mod correlated to the root modes, in the same order. It is a
// float from 0 and 2 and can be specified, but these are the default numbers.
const speed_mod = [1.2, 1.2, 1, 1.25, 1, 1];
// Options for rcs toggle. Default is: true.
const rcs_toggle = [true, false];
// Map ID is either auto-generated by the gameid, or specified as a number between
// 0 and 9999.
const map_id = 0;
// Map density: Float from 0 to 2.
const map_density = 1;
// Weapon drop describes the probability an asteroid will drop a weapon: Float
// from 0 to 10.
const weapon_drop = 0;
// Default crystal drop, which is the percentage of gems that can be collected
// when a ship drains gems (from damage), correlated to the root modes,
// in the same order. It is a float from 0 to 1 and can be specified, but
// these are the default numbers.
const crystal_drop = [1, 1, 1, 0.5, 1, 1];
// Default release crystal, which is allowing or forbidding the release of 
// a crystal when a user presses 'V', correlated to the root modes, in the same
// order. It can be specified.
const release_crystal_default = [false, true, false, false, false, false];
// All release crystal options.
const release_crystal = [true, false];
// Mines self destroy default value.
const mines_self_destroy_default = false;
// All mines self destroy options.
const mines_self_destroy = [true, false];
// Default mines destroy delay, which is a time in miliseconds for mines to self
// destroy if no enemies has triggered it, correlated to the root modes, in the same
// order. The minimum is 0, although no maximum.
const mines_destroy_delay = [18000, 18000, 18000, 18000, 3600, 18000];
// Default healing enabled, correlated to the root modes, in the same order. It
// can be specified.
const healing_enabled_default = [false, true, false, false, false, false];
// All healing enabled options.
const healing_enabled = [true, false];
//  Default healing ratio. It cannot be specified, but it is a float between
// 0 and 2.
const healing_ratio = 1;
// Default shield regen factor: Minimum is 0, although no maximum.
const shield_regen_factor = 1;
// Default power regen factor: Minimum is 0, although no maximum.
const power_regen_factor = 1;
// Default ship invulnerability.
const invulnerable_ships_default = false;
// All ship invulnerability options.
const invulnerable_ships = [true, false];
// Default weapon store access.
const weapons_store_default = true;
// All weapon store access options.
const weapons_store = [true, false];
// Default radar zoom.
const radar_zoom_default = 2;
// All radar zoom options.
const radar_zoom = [1, 2, 4];
// Default auto refill for energy and shield pill.
const auto_refill_default = false;
// All auto refill options.
const auto_refill = [true, false];
// Default projectile speed, affecting rockets, missiles, and torpedos:
// Minimum is 0, although no maximum.
const projectile_speed = 1;
// Default choose ship, which is an array of ships type codes that are selected
// when a player first joins a game, eg. [301, 302, 303].
const choose_ship = [];
// Default value of collider, which specifies if a player ship is able to
// collide with any object.
const collider_default = false;
// All collider options.
const collider = [true, false];
// Default value of acw allowed, which unlocks limits in some options in order
// to do an AOW/ACW similar modded game.
const acw_allowed_default = false;
// All acw allowed options.
const acw_allowed = [true, false];

// Survival mode specific options -----

// Default value of survival time: Minimum is 0, although no maximum.
const survival_time = 60;

// Team mode specific options -----

// Hues: Default is auto generated hue numbers, otherwise, an array of hue
// numbers with each team specified is needed, given the array is the same
// length of that of 'friendly colours'.
const hues = [];
// Default value of station regeneration factor.
const station_regeneration = 1;
// Default value of station size: Integer from 1 to 5.
const station_size = 2;
// Default value of station crystal capactiy: Float from 0.1 to 10.
const station_crystal_capacity = 1;
// Default value of station repair threshold: Float from 0 to 1.
const station_repair_threshold = 0.25;
// Default value of auto assign teams.
const auto_assign_teams_default = false;
// All auto assign teams options.
const auto_assign_teams = [true, false];

// Deathmatch mode specific options -----

// An array containing some arrays, describing the ship groups that a user
// can choose from in each round, eg.
// ship_groups: [
//   ["U-Sniper","Howler"],
//   ["Crusader","Pioneer"]
// ]
const ship_groups = [];
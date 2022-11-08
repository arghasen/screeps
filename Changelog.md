# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [v0.6.1](https://github.com/arghasen/screeps/releases/tag/v0.6.1) - 2022-11-08

<small>[Compare with v0.6.0](https://github.com/arghasen/screeps/compare/v0.6.0...v0.6.1)</small>


## [v0.6.0](https://github.com/arghasen/screeps/releases/tag/v0.6.0) - 2022-11-07

<small>[Compare with v0.5.0](https://github.com/arghasen/screeps/compare/v0.5.0...v0.6.0)</small>

### Features
- Memory now segmented by rooms ([9fe2761](https://github.com/arghasen/screeps/commit/9fe2761a8659b78267ec4c59cd92a1777030b1bb) by Argha Sen).
- Rooms can request builders from other rooms ([b1fa985](https://github.com/arghasen/screeps/commit/b1fa985f433f386fbf6cbf2d1d311b9457ba1cd8) by Argha Sen).
- Lvl3 extenstions, flag reading, basic claimer support ([6970a26](https://github.com/arghasen/screeps/commit/6970a26a458098391ec5bef222bf71184790f61b) by Argha Sen).
- Creeps check fatigue before moving, towers for defense ([c3be78e](https://github.com/arghasen/screeps/commit/c3be78ebaf7a272e10fd57e022e636e6d158f89b) by Argha Sen).


## [v0.5.0](https://github.com/arghasen/screeps/releases/tag/v0.5.0) - 2022-11-06

<small>[Compare with v0.4.0](https://github.com/arghasen/screeps/compare/v0.4.0...v0.5.0)</small>

### Bug Fixes
- Roads creation now done as a state machine ([45d615f](https://github.com/arghasen/screeps/commit/45d615f8032f32ddb7a517aa40694154296de57b) by Argha Sen).
- Kernel gives full stacktrace on error.  #4 ([71dad1e](https://github.com/arghasen/screeps/commit/71dad1ea31bbde209830ab4e6cbcad0c1b06c605) by Argha Sen).
- Spawn was not building creeps ([d6665ce](https://github.com/arghasen/screeps/commit/d6665cee24248e671531815c159d06ab67647fa5) by Argha Sen).
- Check cost before trying to spawn. ([9b9ba4d](https://github.com/arghasen/screeps/commit/9b9ba4d36cf9c299d6e5b19c89390ff7b188e5ce) by Argha Sen).
- Creeps not getting employed ([c2ca441](https://github.com/arghasen/screeps/commit/c2ca44198baed128ac8da3af42ccb3342fd63b01) by Argha Sen).
- Broken build due to test files ([219cc75](https://github.com/arghasen/screeps/commit/219cc756ba8d752e48dc50d59208eb6e0bbdc8cb) by Argha Sen).

### Code Refactoring
- Fix bunch of eslint errors ([ae09ced](https://github.com/arghasen/screeps/commit/ae09cedeb6afa27bfbbd6071799155c9f7d469d3) by Argha Sen).
- Have worker counts in employment ([2f6bf66](https://github.com/arghasen/screeps/commit/2f6bf6630dd28b7a296b700611ce4c848c57a929) by Argha Sen).
- Add back old workers code as creep actions ([f2e4d79](https://github.com/arghasen/screeps/commit/f2e4d794244f640102fc40d8dcf243c7b4fba765) by Argha Sen).

### Features
- Implement continuous harvesting ([61777cc](https://github.com/arghasen/screeps/commit/61777cced4469e32c1bf4a715161d57e3786697a) by Argha Sen).
- Add road and continious harvestor ([9463678](https://github.com/arghasen/screeps/commit/94636786f7c3aee50c3bfba0e52d89ba5a40b5de) by Argha Sen).
- Add screeps-fns from arcos ([b3d9c5d](https://github.com/arghasen/screeps/commit/b3d9c5d4c5234826d0520939dac3d859a218d080) by Argha Sen).
- Spawn no longer gives role, employer can employ harvesters ([b4e99ef](https://github.com/arghasen/screeps/commit/b4e99ef5b5db2df8003fddb619e3550be992549f) by Argha Sen).
- Add ability to spawn creeps ([e49f4e4](https://github.com/arghasen/screeps/commit/e49f4e40a249d45d79be1b2158273225e0916aed) by Argha Sen).


## [v0.4.0](https://github.com/arghasen/screeps/releases/tag/v0.4.0) - 2022-11-05

<small>[Compare with 2022.02.04-v1](https://github.com/arghasen/screeps/compare/2022.02.04-v1...v0.4.0)</small>

### Code Refactoring
- Move ai file to its own subdirectory ([dfeed23](https://github.com/arghasen/screeps/commit/dfeed2359121f81e8c19885402df60357ab83e53) by Argha Sen).

### Features
- Runnable processes now can be run with type safety ([0f4a06f](https://github.com/arghasen/screeps/commit/0f4a06f49ce33738f705de5e6a7ed660d819c9a0) by Argha Sen).


## [2022.02.04-v1](https://github.com/arghasen/screeps/releases/tag/2022.02.04-v1) - 2022-02-04

<small>[Compare with 2022-02.02-v0.1](https://github.com/arghasen/screeps/compare/2022-02.02-v0.1...2022.02.04-v1)</small>


## [2022-02.02-v0.1](https://github.com/arghasen/screeps/releases/tag/2022-02.02-v0.1) - 2022-02-01

<small>[Compare with 2022.01.28-v0](https://github.com/arghasen/screeps/compare/2022.01.28-v0...2022-02.02-v0.1)</small>


## [2022.01.28-v0](https://github.com/arghasen/screeps/releases/tag/2022.01.28-v0) - 2022-01-28

<small>[Compare with first commit](https://github.com/arghasen/screeps/compare/d065b2cf9f96cd86c4c748fe3211405555e97222...2022.01.28-v0)</small>



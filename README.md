# Slowdeath AI ( ai for screeps)

[![Node.js CI](https://github.com/arghasen/screeps/actions/workflows/node.js.yml/badge.svg)](https://github.com/arghasen/screeps/actions/workflows/node.js.yml)

![Release](https://img.shields.io/github/v/release/arghasen/screeps?style=for-the-badge)
![last-commit](https://img.shields.io/github/last-commit/arghasen/screeps?style=for-the-badge)
![language](https://img.shields.io/github/languages/top/arghasen/screeps?style=for-the-badge)
![GPL Licence](https://img.shields.io/github/license/arghasen/screeps?style=for-the-badge)
![files](https://img.shields.io/github/directory-file-count/arghasen/screeps?style=for-the-badge)

Code for my screeps AI.

# Bot Types

- Harvester
- Upgrader
- Builder
- Continuous Harvester
- Claimer
- Hauler

# AI Improvement Plan (March 26, 2024)

## 1. Smarter Creep Role Assignment

- Implement dynamic role assignment based on:
  - Room energy levels
  - Construction needs
  - Current population distribution
  - Room level and development stage
- Add role switching based on immediate needs
- Optimize creep body composition per role

## 2. Improved Resource Management

- Implement smarter resource distribution:
  - Dynamic storage thresholds
  - Emergency resource reserves
  - Better link network optimization
  - Smarter container usage
- Add resource flow visualization
- Implement resource shortage alerts

## 3. Enhanced Room Development Strategy

- Add strategic room expansion planning
- Implement better defense structure placement
- Optimize extension layouts
- Add room specialization (mining, storage, etc.)
- Implement room state tracking

## 4. Smarter Creep Behavior

- Improve path optimization using PathFinder
- Add dynamic source selection
- Implement emergency response behaviors
- Add creep body optimization based on role
- Implement better movement patterns

## 5. Defense and Security

- Add hostile creep detection and response
- Implement wall repair strategies
- Add tower management
- Create emergency evacuation protocols
- Add room defense status monitoring

## 6. Performance Optimization

- Implement better path caching
- Add memory cleanup routines
- Optimize CPU usage
- Add room state caching
- Implement tick-based optimizations

## 7. Advanced Features

- Add power creep management
- Implement market trading
- Add remote mining capabilities
- Implement multi-room coordination
- Add empire-wide resource sharing

## Implementation Priority

1. Dynamic role assignment (High Impact, Medium Effort)
2. Improved resource management (High Impact, Medium Effort)
3. Enhanced creep behavior (High Impact, High Effort)
4. Better room development strategy (Medium Impact, High Effort)
5. Defense and security (Medium Impact, Medium Effort)
6. Performance optimization (Low Impact, High Effort)
7. Advanced features (High Impact, High Effort)

## Progress Tracking

- [ ] Phase 1: Core Improvements (Role Assignment & Resource Management)
- [ ] Phase 2: Behavior & Strategy (Creep Behavior & Room Development)
- [ ] Phase 3: Security & Performance (Defense & Optimization)
- [ ] Phase 4: Advanced Features (Power Creeps & Market)

# Automated Animations Integration for Final Fantasy XIV System

This document describes the integration between the Final Fantasy XIV FoundryVTT system and TheRipper93's Automated Animations module.

## Overview

The Automated Animations integration automatically triggers animations when players use abilities, actions, and spells in the Final Fantasy XIV system. The integration supports both basic animations and advanced Final Fantasy-specific features.

## Requirements

- **Automated Animations module** by TheRipper93 must be installed and active
- **JB2A Database** (Free or Patreon) for animation assets
- Final Fantasy XIV system v0.1.45 or later

## Features

### Basic Animation Support
- Automatic animation triggering for action items
- Attack and damage roll differentiation
- Support for targeted and area-of-effect abilities
- Integration with Final Fantasy chat system

### Advanced Final Fantasy Features
- **Elemental Effects**: Fire, Ice, Lightning, Earth, Wind, and Water animations
- **Job-Specific Animations**: Different effects based on character job/class
- **Critical Hit Effects**: Enhanced animations for critical hits
- **Direct Hit Support**: Special animations for direct hit abilities
- **Area Effect Support**: Proper handling of AoE abilities with split damage
- **Action Type Recognition**: Different animations for weaponskills, spells, reactions, etc.

## Configuration

Access the Automated Animations settings through the system settings menu:

### Enable Automated Animations Integration
- **Default**: Enabled
- Controls whether Automated Animations are processed at all

### Animation Delay (ms)
- **Default**: 500ms
- **Range**: 0-2000ms
- Adds a delay before playing animations to help synchronize with chat messages

### Automated Animations Debug Mode
- **Default**: Disabled
- Enables detailed logging for troubleshooting Automated Animations integration issues

## How It Works

### Data Extraction
The system hooks into the `createChatMessage` event and extracts:
- **Item**: The action/ability being used
- **Source Token**: The character performing the action
- **Targets**: Any targeted tokens
- **Roll Type**: Whether this is an attack, damage, healing, or generic action

### Animation Processing
1. **Basic Processing**: Standard JB2A animation selection based on item name and type
2. **Enhanced Processing**: Final Fantasy-specific enhancements including:
   - Element-based animation selection
   - Job-specific visual effects
   - Critical hit and direct hit enhancements
   - Area effect handling

### Supported Item Types
- **Actions** (type: "action")
  - Primary abilities (weaponskills)
  - Secondary abilities (spells)
  - Reactions
  - Limit breaks
  - Combo abilities

## Animation Mapping

### By Element
- **Fire**: Flame-based animations
- **Ice**: Frost and ice effects
- **Lightning**: Electric and thunder effects
- **Earth**: Stone and earth-based effects
- **Wind**: Air and wind animations
- **Water**: Water and healing effects

### By Job Class
The system can apply job-specific animations based on the active job:
- **Melee Jobs**: Sword swings, martial arts
- **Ranged Jobs**: Bow shots, throwing weapons
- **Magic Jobs**: Spell casting, magical projectiles
- **Healing Jobs**: Healing auras, supportive effects

### By Action Type
- **Weaponskills**: Physical attack animations
- **Spells**: Magical casting and projectile effects
- **Reactions**: Quick defensive or counter animations
- **Limit Breaks**: Enhanced, dramatic effect sequences

## Troubleshooting

### Animations Not Playing
1. Verify Automated Animations module is active
2. Check that Automated Animations Integration is enabled in system settings
3. Ensure you have appropriate JB2A animation databases installed
4. Enable Debug Mode to see detailed logging

### Animation Timing Issues
1. Adjust the Animation Delay setting
2. Check network latency if playing online
3. Verify that only one client is processing animations (check user permissions)

### Missing Animations for Specific Abilities
1. Check JB2A database for matching animation names
2. Use Automated Animations' Global Automatic Recognition menu to assign animations
3. Configure animations using the "A-A" button on item sheets
4. Report missing mappings as enhancement requests

## Debug Information

When Debug Mode is enabled, the integration logs:
- Item data extraction
- Animation selection process
- Final Fantasy-specific enhancements
- JB2A traffic cop calls
- Error messages and stack traces

## Compatibility

### Known Compatible Modules
- Automated JB2A Animations (all versions)
- JB2A Database (Free and Patreon)
- Dice So Nice (animation sequencing)
- Token Magic FX (combined effects)

### Known Issues
- Some very fast sequences may have timing issues
- Large AoE abilities with many targets may cause performance impact
- Experimental damage application animations may not work with all modules

## Support

For issues specific to the JB2A integration:
1. Enable Debug Mode and reproduce the issue
2. Check browser console for error messages
3. Report issues on the Final Fantasy XIV system repository
4. Include relevant log information and steps to reproduce

For general JB2A questions, consult the Automated JB2A Animations documentation. 
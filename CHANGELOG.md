# Change Log

All notable changes to the "FabFeb Countdown" extension will be documented in this file.

## [1.1.0] - 2024-12-XX

### Added
- 🔄 **Alternating Message System**: Speech bubble now cycles through multiple messages on each donut click
- 💬 **New Custom Messages**: 
  - "Remember! The call for speakers close August 31!"
  - "💚 #SNÆCKS 💚"
  - "💚"
- 🛠️ **Developer-Friendly Message Management**: Easy-to-extend message array system for adding more messages
- 🔁 **Smart Message Cycling**: Messages alternate automatically with each interaction

### Enhanced
- 🍩 Improved donut interaction experience with varied speech bubble content
- 📝 Better message management system in ConfigurationManager
- 🎯 More engaging user experience with diverse countdown messages

### Technical Improvements
- Added `getNextAlternatingMessage()` method for message cycling
- Enhanced ConfigurationManager with message array support
- Added `addAlternatingMessage()` method for easy message extension
- Improved message state management and cycling logic

## [1.0.0] - 2024-01-XX

### Added
- 🍩 Interactive animated donut sprite companion
- ⏰ Smart countdown system with configurable target dates
- 🎭 Beautiful speech bubble with click interactions
- ⚙️ Comprehensive configuration system
- 🎨 VS Code theme integration (dark/light mode support)
- ⌨️ Keyboard shortcuts (Ctrl+Shift+F / Cmd+Shift+F)
- 📱 Responsive design for different window sizes
- 🔧 Professional error handling and validation
- 📚 Comprehensive documentation and user guide

### Features
- Multiple date format support (ISO, natural language, etc.)
- Configurable animation speeds (slow, normal, fast)
- Auto-hide speech bubble with customizable timeout
- Intelligent countdown messaging based on days remaining
- Secure webview implementation with CSP
- Professional TypeScript codebase

### Initial Release
This is the first public release of FabFeb Countdown - bringing joy to developers everywhere! 🎉

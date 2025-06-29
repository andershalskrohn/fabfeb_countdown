# 🍩 FabFeb Countdown

A delightful VS Code extension that brings an animated donut sprite companion to your editor! Watch your adorable FabFeb donut bounce around while counting down to your special date.

## ✨ Features

- **🍩 Animated Donut Sprite**: A charming donut companion that lives in your VS Code editor
- **⏰ Smart Countdown**: Displays days remaining until your target date with intelligent messaging
- **�� Interactive Speech Bubble**: Click the donut to see countdown messages in a beautiful speech bubble
- **🎨 Theme Integration**: Automatically adapts to your VS Code theme (dark/light mode)
- **⚙️ Highly Configurable**: Customize target date, animation speed, and behavior
- **🎯 Non-Intrusive**: Stays in the corner and doesn't interfere with your coding
- **⌨️ Keyboard Shortcut**: Quick access with `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac)

## 🚀 Installation

### Manual Installation (Development)
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` to open Extension Development Host
5. The extension will be automatically activated

## 🎮 Usage

### Basic Usage
1. **Automatic Activation**: The extension activates when VS Code starts
2. **Find Your Donut**: Look for the cute donut sprite in the bottom-right corner of your editor
3. **Click to Interact**: Click the donut to see your countdown message
4. **Watch Animations**: Enjoy the bouncing animations

### Commands
- **Show Countdown**: Use `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) to trigger the countdown display
- **Command Palette**: Run `FabFeb: Show Countdown` from the Command Palette (`Ctrl+Shift+P`)

## ⚙️ Configuration

Customize your FabFeb experience through VS Code settings:

### Settings Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `fabfebCountdown.targetDate` | string | `"2026-02-01"` | Your target countdown date (YYYY-MM-DD format) |
| `fabfebCountdown.animationSpeed` | enum | `"normal"` | Animation speed: `"slow"`, `"normal"`, or `"fast"` |
| `fabfebCountdown.enabled` | boolean | `true` | Enable or disable the donut sprite |
| `fabfebCountdown.autoHideTimeout` | number | `3000` | Time (ms) before speech bubble hides (1000-10000) |

### How to Configure

#### Via Settings UI
1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "FabFeb"
3. Adjust settings as desired

#### Via settings.json
```json
{
    "fabfebCountdown.targetDate": "2025-12-25",
    "fabfebCountdown.animationSpeed": "fast",
    "fabfebCountdown.enabled": true,
    "fabfebCountdown.autoHideTimeout": 5000
}
```

## 📅 Date Format Examples

The extension accepts various date formats:

- `"2025-12-25"` - ISO format (recommended)
- `"2025/12/25"` - Slash format
- `"December 25, 2025"` - Natural language
- `"Dec 25 2025"` - Short format

## 🎨 Customization Tips

### Target Date Ideas
- **Project Deadlines**: Set to your next release date
- **Personal Events**: Birthday, anniversary, vacation
- **Holidays**: Christmas, New Year, Halloween
- **Conferences**: FabFeb, developer conferences, meetups
- **Learning Goals**: Certification exam dates

### Animation Speed Guide
- **Slow**: Relaxed, meditative bouncing
- **Normal**: Balanced, pleasant animations
- **Fast**: Energetic, quick movements

## �� Troubleshooting

### Common Issues

#### Donut Not Appearing
1. Check if extension is enabled: `fabfebCountdown.enabled: true`
2. Try reloading VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
3. Ensure the webview panel is visible (look for the FabFeb tab)

#### Invalid Date Error
1. Use YYYY-MM-DD format for best results
2. Check VS Code's Problems panel for date validation errors
3. Reset to default: `"fabfebCountdown.targetDate": "2026-02-01"`

#### Speech Bubble Not Showing
1. Click directly on the donut sprite
2. Check `autoHideTimeout` setting (should be 1000-10000ms)
3. Try using the keyboard shortcut `Ctrl+Shift+F`

## 🛣️ Roadmap

### Coming Soon (Milestone 6)
- **🎨 Enhanced Theme Integration**: Better color adaptation
- **🚀 Performance Optimizations**: Smoother animations
- **🛡️ Error Resilience**: Better error handling and recovery

### Future Features
- **🚶 Walking Animations**: Donut moves around the editor
- **🎵 Sound Effects**: Optional audio feedback
- **🎪 Multiple Sprites**: Choose different characters
- **📊 Progress Tracking**: Visual progress bars
- **🎉 Celebration Effects**: Special animations when countdown reaches zero

---

**Enjoy your FabFeb countdown! 🍩✨**

> Made with ❤️ for the developer community. May your donuts be sweet and your countdowns exciting!
npr
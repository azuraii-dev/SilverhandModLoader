# Silverhand Mod Loader

A modern, cyberpunk-themed mod loader for Cyberpunk 2077 built with Electron and React. This application provides a virtual filesystem overlay to manage mods without modifying the original game files.

## Features

### 🎮 Core Functionality
- **Virtual Filesystem Overlay**: Mods are applied at runtime without modifying original game files
- **Drag & Drop Mod Installation**: Simply drag .zip mod files into the application
- **Load Order Management**: Reorder mods with intuitive drag-and-drop interface
- **Conflict Detection**: Automatically detects and warns about file conflicts between mods
- **Game Integration**: One-click game launching with mods applied

### 🎨 User Interface
- **Cyberpunk-themed Design**: Neon colors and futuristic styling
- **Responsive Layout**: Clean, modern interface optimized for desktop use
- **Real-time Status**: Live updates on mod status, conflicts, and game readiness
- **Dark Mode**: Easy on the eyes during long modding sessions
- **Performance Optimized**: Virtualized lists handle 500+ mods efficiently

### 🔧 Mod Management
- **Automatic Extraction**: Zip files are automatically extracted and validated
- **Mod Validation**: Ensures proper mod structure (archive/, r6/, redscript/, engine/, red4ext/)
- **Custom Metadata**: Rename mods, add tags, and categorize without modifying folder names
- **Enable/Disable Toggle**: Quick mod activation without deletion
- **Safe Deletion**: Remove mods with confirmation dialogs
- **Smart File Organization**: Automatically organizes mod files to correct locations

### 📦 Dependency Management
- **Built-in Dependency Database**: Comprehensive database of Cyberpunk 2077 frameworks and dependencies
- **Automatic Detection**: Scans for missing dependencies based on mod requirements
- **Installation Guides**: Step-by-step instructions with direct NexusMods links
- **Framework Support**: ArchiveXL, TweakXL, Codeware, RED4ext, REDScript, CET, Input Loader, Equipment-EX
- **Status Verification**: Real-time checking of installed dependencies
- **Troubleshooting Integration**: Built into settings panel for easy access

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Cyberpunk 2077 installed

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run electron-dev
```

### Build for Production
```bash
npm run electron-pack
```

This creates a standalone executable in `dist/silverhand-mod-loader-win32-x64/` that requires no installation or dependencies on target systems.

## Usage Guide

### 1. Initial Setup
1. Launch the application
2. Go to Settings
3. Set your Cyberpunk 2077 installation directory
4. The path should point to the folder containing `Cyberpunk2077.exe`

### 2. Installing Mods
1. Navigate to "Import Mods"
2. Drag and drop .zip mod files into the drop zone
3. The application will automatically extract and validate mods
4. Invalid mods will show error messages with details

### 3. Managing Mods
1. Go to "Mod Library" to see all installed mods
2. Use the power button to enable/disable mods
3. Drag enabled mods by the grip handle to reorder them
4. Click the edit button to customize mod names, tags, and categories
5. Use the search and filter options to find specific mods

### 4. Managing Dependencies
Dependencies are automatically detected and managed through the built-in database:
1. Go to Settings and check the Troubleshooting panel
2. Missing dependencies will be highlighted with installation instructions
3. Follow the provided NexusMods links for manual installation
4. The system will verify installation status in real-time

### 5. Launching the Game
1. Ensure your game path is configured in Settings
2. Install required dependencies (check Settings troubleshooting panel)
3. Enable desired mods in the Mod Library  
4. Click "Launch Game" in the header
5. **Virtual environment created**: Complete game mirror with symbolic links + mod overlays
6. **Game launches from virtual directory**: Sees all mods in expected locations  
7. **Original game untouched**: Steam/GOG launches remain completely vanilla

## Technical Details

### 🛡️ Non-Destructive Virtual Environment
- **Stage 1**: Complete game directory mirror created in `virtual_game/` using symbolic links
- **Stage 2**: Mod files overlaid on top of symbolic links (respecting load order)
- **Stage 3**: Game launched from virtual directory - sees all mods + originals
- **Result**: Original game directory remains **completely untouched** and safe
- **Benefits**: Steam validates fine, achievements work, zero corruption risk

### Disk Space Usage
- **Symbolic Links**: ~5-10 MB (pointers to original game files)
- **Mod Overlays**: Full size of enabled mod files only
- **Example**: 70GB game + 3GB mods = ~3.01GB virtual_game folder

### Supported Mod Types
- **Archive Mods**: `.archive` files in `archive/pc/mod/` folder
- **Redscript Mods**: `.reds` files in `r6/scripts/` folder
- **CET Mods**: Lua scripts in `bin/x64/plugins/cyber_engine_tweaks/mods/`
- **RED4ext Plugins**: `.dll` files in `red4ext/plugins/[PluginName]/`
- **TweakXL Tweaks**: `.yaml` and `.tweak` files in `r6/tweaks/`
- **Engine Configs**: Configuration files in `engine/config/platform/pc/`

### Mod Metadata System
Each mod can have custom metadata stored in `mod_loader_info.json`:
```json
{
  "displayName": "Custom Mod Name",
  "description": "My custom description",
  "tags": ["UI", "Gameplay", "Cyberpunk"],
  "category": "Interface",
  "author": "ModAuthor",
  "version": "1.2.0"
}
```

### Configuration Format
The `config/load_order.json` file stores:
```json
{
  "gameInstallPath": "C:\\Program Files\\Cyberpunk 2077",
  "enabledMods": ["mod1", "mod2"],
  "modLoadOrder": ["mod1", "mod2"],
  "profiles": {
    "default": {
      "name": "Default Profile",
      "enabledMods": [],
      "loadOrder": []
    }
  },
  "currentProfile": "default"
}
```

## Conflict Resolution

When multiple mods modify the same file:
1. The application detects conflicts automatically
2. Warning banners appear with conflict details
3. Load order determines which mod takes precedence
4. Last mod in load order wins conflicts

## Development

### Tech Stack
- **Electron**: Desktop application framework
- **React**: Frontend UI framework
- **TailwindCSS**: Utility-first CSS framework
- **React Beautiful DnD**: Drag and drop functionality
- **React Dropzone**: File drop interface
- **React Window**: Virtualization for performance
- **Lucide React**: Icon library

### Project Structure
```
src/
├── components/           # React components
│   ├── Header.js        # Main header with launch button
│   ├── ModList.js       # Mod library with virtualization
│   ├── VirtualizedModList.js # High-performance mod list
│   ├── ModEditModal.js  # Mod metadata editing
│   ├── ModImporter.js   # File import interface
│   ├── Settings.js      # Configuration panel
│   ├── GameLauncher.js  # Game launch controls
│   ├── ConflictDetector.js # Conflict warning system
│   ├── TroubleshootingPanel.js # Dependency diagnostics
│   └── ErrorBoundary.js # Error handling
├── utils/               # Utility functions
│   └── dependencyDatabase.js # Dependency information
├── App.js              # Main application component
└── index.js            # React entry point

public/
├── electron.js         # Main Electron process
├── preload.js         # Security bridge
└── index.html         # Entry point HTML
```

### Building

The application uses electron-packager for creating executables:

#### Development Build
```bash
npm run electron-dev
```

#### Production Build  
```bash
npm run electron-pack
```

This creates a standalone `.exe` in `dist/silverhand-mod-loader-win32-x64/` containing:
- Complete application bundle
- All dependencies included
- No installation required
- Portable across Windows systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Disclaimer

This is a third-party tool not affiliated with CD Projekt RED. Use at your own risk. Always backup your save files before using mods. The developers are not responsible for any damage to your game or system.

## Troubleshooting

### Common Issues

**Game won't launch**
- Verify Cyberpunk 2077 installation path in Settings
- Ensure `Cyberpunk2077.exe` exists in the specified directory
- Check that no antivirus is blocking the application

**Mods not working**
- Verify mod structure contains required folders (archive/, r6/, etc.)
- Check load order - some mods must load before others
- Ensure mods are enabled in the Mod Library

**Import failures**
- Only .zip files are supported
- Mod must contain valid Cyberpunk 2077 mod structure
- File may be corrupted - try re-downloading

**Conflicts detected**
- Review conflicting mods in the warning panel
- Reorder mods to change precedence
- Consider disabling conflicting mods
- Look for compatibility patches from mod authors

**Missing dependencies**
- Check Settings → Troubleshooting panel for dependency status
- Follow provided NexusMods links for manual installation
- Ensure dependencies are installed to correct game directory
- Use "Test IPC Handlers" to verify dependency detection

**Mods not working in game**
- Verify game path is set correctly in Settings
- Ensure you clicked "Launch Game" from the mod loader (creates virtual environment)
- Look for console logs showing "[VIRTUAL]" and "[OVERLAY]" messages
- Use "Open Virtual Folder" in Settings to verify mod files are present
- Try "Clean Virtual Env" and launch again if issues persist

**Performance issues with large mod lists**
- The mod list is virtualized and should handle 500+ mods efficiently
- If experiencing slowdowns, try clearing browser cache or restarting the app
- Use search and filters to navigate large collections

---

**Wake the f*ck up, samurai. We have mods to install.** 🤖⚡
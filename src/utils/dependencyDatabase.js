// Cyberpunk 2077 Mod Dependencies Database
export const DEPENDENCY_DATABASE = {
  'archivexl': {
    name: 'ArchiveXL',
    description: 'Framework for loading custom archive files',
    version: '1.13.0+',
    required: true,
    nexusId: '4198',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/4198',
    installPath: 'red4ext/plugins/ArchiveXL/',
    files: ['ArchiveXL.dll'],
    folderStructure: [
      'red4ext/plugins/ArchiveXL/ArchiveXL.dll'
    ],
    aliases: ['archiveXL', 'archive_xl', 'ArchiveXL'],
    category: 'Framework'
  },
  
  'tweakxl': {
    name: 'TweakXL',
    description: 'Framework for loading custom tweaks and game modifications',
    version: '1.8.0+',
    required: true,
    nexusId: '4197',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/4197',
    installPath: 'red4ext/plugins/TweakXL/',
    files: ['TweakXL.dll'],
    folderStructure: [
      'red4ext/plugins/TweakXL/TweakXL.dll'
    ],
    aliases: ['tweakXL', 'tweak_xl', 'TweakXL'],
    category: 'Framework'
  },
  
  'codeware': {
    name: 'Codeware',
    description: 'Library for mod developers with common utilities and frameworks',
    version: '1.4.0+',
    required: true,
    nexusId: '7780',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/7780',
    installPath: 'red4ext/plugins/Codeware/',
    files: ['Codeware.dll'],
    folderStructure: [
      'red4ext/plugins/Codeware/Codeware.dll'
    ],
    aliases: ['codeware', 'Codeware'],
    category: 'Framework'
  },
  
  'redscript': {
    name: 'REDScript',
    description: 'Scripting framework for Cyberpunk 2077',
    version: '0.5.17+',
    required: true,
    nexusId: '1511',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/1511',
    installPath: 'engine/',
    files: ['redscript.dll'],
    folderStructure: [
      'engine/redscript.dll',
      'engine/config/base/scripts.ini'
    ],
    aliases: ['redscript', 'REDScript', 'red_script'],
    category: 'Framework'
  },
  
  'red4ext': {
    name: 'RED4ext',
    description: 'Script extender for Cyberpunk 2077',
    version: '1.18.0+',
    required: true,
    nexusId: '2380',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/2380',
    installPath: 'red4ext/',
    files: ['RED4ext.dll'],
    folderStructure: [
      'red4ext/RED4ext.dll',
      'red4ext/config.ini'
    ],
    aliases: ['red4ext', 'RED4ext', 'red_4_ext'],
    category: 'Framework'
  },
  
  'cyber_engine_tweaks': {
    name: 'Cyber Engine Tweaks',
    description: 'Framework for Lua scripting and game modifications',
    version: '1.31.0+',
    required: false,
    nexusId: '107',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/107',
    installPath: 'bin/x64/plugins/cyber_engine_tweaks/',
    files: ['version.dll'],
    folderStructure: [
      'bin/x64/plugins/cyber_engine_tweaks/version.dll',
      'bin/x64/plugins/cyber_engine_tweaks/mods/'
    ],
    aliases: ['cet', 'cyber_engine_tweaks', 'CyberEngineTweaks'],
    category: 'Framework'
  },
  
  'input_loader': {
    name: 'Input Loader',
    description: 'Framework for custom input bindings and controls',
    version: '0.2.1+',
    required: false,
    nexusId: '4575',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/4575',
    installPath: 'red4ext/plugins/InputLoader/',
    files: ['InputLoader.dll'],
    folderStructure: [
      'red4ext/plugins/InputLoader/InputLoader.dll'
    ],
    aliases: ['inputloader', 'InputLoader', 'input_loader'],
    category: 'Framework'
  },
  
  'virtual_car_dealer': {
    name: 'Virtual Car Dealer',
    description: 'Framework for vehicle spawning and management',
    version: '1.0.0+',
    required: false,
    nexusId: '4454',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/4454',
    installPath: 'red4ext/plugins/VirtualCarDealer/',
    files: ['VirtualCarDealer.dll'],
    folderStructure: [
      'red4ext/plugins/VirtualCarDealer/VirtualCarDealer.dll'
    ],
    aliases: ['virtualcardealer', 'VirtualCarDealer', 'virtual_car_dealer'],
    category: 'Gameplay'
  },
  
  'equipment_ex': {
    name: 'Equipment-EX',
    description: 'Framework for custom equipment and clothing',
    version: '1.2.5+',
    required: false,
    nexusId: '6945',
    nexusUrl: 'https://www.nexusmods.com/cyberpunk2077/mods/6945',
    installPath: 'red4ext/plugins/EquipmentEx/',
    files: ['EquipmentEx.dll'],
    folderStructure: [
      'red4ext/plugins/EquipmentEx/EquipmentEx.dll'
    ],
    aliases: ['equipmentex', 'EquipmentEx', 'equipment_ex'],
    category: 'Framework'
  }
};

// Common dependency patterns found in REDScript errors
export const DEPENDENCY_PATTERNS = [
  {
    pattern: /archiveXL|archive_xl/i,
    dependency: 'archivexl',
    description: 'Missing ArchiveXL framework'
  },
  {
    pattern: /tweakXL|tweak_xl/i,
    dependency: 'tweakxl',
    description: 'Missing TweakXL framework'
  },
  {
    pattern: /Codeware|codeware/i,
    dependency: 'codeware',
    description: 'Missing Codeware library'
  },
  {
    pattern: /red4ext\\plugins\\([^\\]+)/i,
    dependency: null, // Will be determined by capture group
    description: 'Missing RED4ext plugin'
  },
  {
    pattern: /VirtualCarDealer/i,
    dependency: 'virtual_car_dealer',
    description: 'Missing Virtual Car Dealer'
  },
  {
    pattern: /EquipmentEx/i,
    dependency: 'equipment_ex',
    description: 'Missing Equipment-EX'
  },
  {
    pattern: /InputLoader/i,
    dependency: 'input_loader',
    description: 'Missing Input Loader'
  }
];

// Analyze error text to detect missing dependencies
export function detectMissingDependencies(errorText) {
  const missingDeps = new Set();
  const errorLines = errorText.split('\n');
  
  for (const line of errorLines) {
    for (const pattern of DEPENDENCY_PATTERNS) {
      const match = line.match(pattern.pattern);
      if (match) {
        if (pattern.dependency) {
          missingDeps.add(pattern.dependency);
        } else if (match[1]) {
          // Handle red4ext plugins dynamically
          const pluginName = match[1].toLowerCase();
          const foundDep = Object.keys(DEPENDENCY_DATABASE).find(key =>
            DEPENDENCY_DATABASE[key].aliases.some(alias => 
              alias.toLowerCase() === pluginName
            )
          );
          if (foundDep) {
            missingDeps.add(foundDep);
          }
        }
      }
    }
  }
  
  return Array.from(missingDeps).map(depKey => DEPENDENCY_DATABASE[depKey]).filter(Boolean);
}

// Parse mod files for dependency information
export function parseModDependencies(modContent) {
  const dependencies = [];
  
  // Parse mod.ini file
  if (modContent.modIni) {
    const iniLines = modContent.modIni.split('\n');
    for (const line of iniLines) {
      if (line.toLowerCase().includes('requires') || line.toLowerCase().includes('depends')) {
        // Extract dependency names from ini
        const depMatch = line.match(/['""]([^'""]+)['""]|(\w+)/g);
        if (depMatch) {
          depMatch.forEach(dep => {
            const cleanDep = dep.replace(/['"]/g, '').toLowerCase();
            const foundDep = Object.keys(DEPENDENCY_DATABASE).find(key =>
              DEPENDENCY_DATABASE[key].aliases.some(alias => 
                alias.toLowerCase().includes(cleanDep) || cleanDep.includes(alias.toLowerCase())
              )
            );
            if (foundDep) {
              dependencies.push(DEPENDENCY_DATABASE[foundDep]);
            }
          });
        }
      }
    }
  }
  
  // Parse README.md for dependency mentions
  if (modContent.readme) {
    const readmeText = modContent.readme.toLowerCase();
    Object.keys(DEPENDENCY_DATABASE).forEach(key => {
      const dep = DEPENDENCY_DATABASE[key];
      const mentioned = dep.aliases.some(alias => 
        readmeText.includes(alias.toLowerCase())
      );
      if (mentioned && !dependencies.find(d => d.name === dep.name)) {
        dependencies.push(dep);
      }
    });
  }
  
  return dependencies;
}

// Check if dependency is installed in the game directory
export async function checkDependencyInstalled(dependency, gameInstallPath) {
  if (!gameInstallPath || !dependency.folderStructure) return false;
  
  try {
    // This would need to be implemented via IPC to check actual file system
    // For now, return false to show missing dependencies
    return false;
  } catch (error) {
    return false;
  }
}

// Get installation instructions for a dependency
export function getInstallationInstructions(dependency) {
  return {
    title: `Install ${dependency.name}`,
    steps: [
      `Download ${dependency.name} from NexusMods`,
      `Extract the downloaded file`,
      `Copy files to your Cyberpunk 2077 installation directory:`,
      ...dependency.folderStructure.map(path => `  → ${path}`),
      `Restart Cyberpunk 2077 if it's running`
    ],
    nexusUrl: dependency.nexusUrl,
    installPath: dependency.installPath
  };
}
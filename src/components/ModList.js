import React, { useState, useEffect } from 'react';
import VirtualizedModList from './VirtualizedModList';
import ModEditModal from './ModEditModal';

const ModList = ({ mods, config, onToggleMod, onDeleteMod, enabledMods }) => {
  const [modsWithMetadata, setModsWithMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMod, setEditingMod] = useState(null);
  const [availableCategories, setAvailableCategories] = useState(['Other']);
  const [availableTags, setAvailableTags] = useState([]);

  // Load mods with metadata
  useEffect(() => {
    loadModsWithMetadata();
    loadCategoriesAndTags();
  }, [mods]);

  const loadModsWithMetadata = async () => {
    try {
      setLoading(true);
      const modsData = await window.electronAPI.getModsWithMetadata();
      setModsWithMetadata(modsData);
    } catch (error) {
      console.error('Error loading mods with metadata:', error);
      // Fallback to basic mod data
      setModsWithMetadata(mods.map(mod => ({ ...mod, displayName: mod.id })));
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndTags = async () => {
    try {
      const { categories, tags } = await window.electronAPI.getModCategoriesAndTags();
      setAvailableCategories(categories);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading categories and tags:', error);
    }
  };

  const handleEditMod = async (modId, updates) => {
    try {
      await window.electronAPI.updateModMetadata(modId, updates);
      await loadModsWithMetadata(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating mod metadata:', error);
      throw error;
    }
  };

  const handleViewModFiles = (modId) => {
    window.electronAPI.openModFolder(modId);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto mb-4"></div>
        <p>Loading mod metadata...</p>
      </div>
    );
  }

  if (modsWithMetadata.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg mb-2">No mods installed</p>
        <p>Import some mods using the Import tab to get started!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <VirtualizedModList
        mods={modsWithMetadata}
        enabledMods={enabledMods}
        onToggleMod={onToggleMod}
        onEditMod={(modId) => {
          const mod = modsWithMetadata.find(m => m.id === modId);
          setEditingMod(mod);
        }}
        onViewModFiles={handleViewModFiles}
        onDeleteMod={onDeleteMod}
      />

      <ModEditModal
        mod={editingMod}
        isOpen={!!editingMod}
        onClose={() => setEditingMod(null)}
        onSave={handleEditMod}
        availableCategories={availableCategories}
        availableTags={availableTags}
      />
    </div>
  );
};

export default ModList;
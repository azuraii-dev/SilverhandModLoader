import React, { useState, useEffect } from 'react';
import { X, Save, Tag, User, FileText, Folder, Plus, Trash2 } from 'lucide-react';

const ModEditModal = ({ mod, isOpen, onClose, onSave, availableCategories, availableTags }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
    author: '',
    version: '',
    category: 'Other',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mod && isOpen) {
      setFormData({
        displayName: mod.displayName || mod.id,
        description: mod.description || '',
        author: mod.author || '',
        version: mod.version || '',
        category: mod.category || 'Other',
        tags: mod.tags || []
      });
    }
  }, [mod, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(mod.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving mod:', error);
      alert('Error saving mod changes');
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen || !mod) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-dark border border-cyber-blue rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-cyber-blue flex items-center space-x-2">
              <FileText size={20} />
              <span>Edit Mod Information</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-blue focus:outline-none text-white"
                placeholder="Enter a custom name for this mod"
              />
              <p className="text-xs text-gray-400 mt-1">
                Folder name: <code>{mod.id}</code>
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-blue focus:outline-none text-white"
                rows={3}
                placeholder="Describe what this mod does..."
              />
            </div>

            {/* Author and Version */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-blue focus:outline-none text-white"
                  placeholder="Mod author name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full px-3 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-blue focus:outline-none text-white"
                  placeholder="1.0.0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-blue focus:outline-none text-white"
              >
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              
              {/* Current Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-cyber-blue bg-opacity-20 text-cyber-blue px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-cyber-blue hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              
              {/* Add New Tag */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-blue focus:outline-none text-white"
                  placeholder="Add a tag..."
                />
                <button
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="cyber-button-secondary flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
              
              {/* Popular Tags */}
              {availableTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.slice(0, 10).map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!formData.tags.includes(tag)) {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }));
                          }
                        }}
                        disabled={formData.tags.includes(tag)}
                        className="text-xs bg-gray-600 bg-opacity-50 hover:bg-cyber-blue hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-600">
            <button
              onClick={onClose}
              className="cyber-button-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.displayName.trim()}
              className="cyber-button flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModEditModal;
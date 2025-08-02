import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Eye, Power, GripVertical, Edit3, Tag, FolderOpen, Trash2, Search, Filter } from 'lucide-react';

const ITEM_HEIGHT = 130; // Height of each mod card including spacing
const VISIBLE_ITEMS = 6; // Number of items visible at once

const ModCard = React.memo(({ mod, index, isEnabled, onToggle, onEdit, onViewFiles, onDelete, isDragDisabled }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Gameplay': 'border-green-400 text-green-400',
      'Visual': 'border-blue-400 text-blue-400',
      'Audio': 'border-purple-400 text-purple-400',
      'UI': 'border-yellow-400 text-yellow-400',
      'Performance': 'border-red-400 text-red-400',
      'Utility': 'border-gray-400 text-gray-400',
      'Adult': 'border-pink-400 text-pink-400',
      'Other': 'border-gray-500 text-gray-500'
    };
    return colors[category] || colors['Other'];
  };

  const cardContent = (
    <div 
      className={`cyber-border p-4 rounded-lg transition-all duration-200 h-[110px] flex flex-col ${
        isEnabled 
          ? 'bg-cyber-blue bg-opacity-10 border-cyber-blue' 
          : 'bg-cyber-dark bg-opacity-50 border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex items-start space-x-3 flex-1 min-w-0 h-full">
          {!isDragDisabled && (
            <div className="text-gray-400 hover:text-gray-200 cursor-grab mt-1">
              <GripVertical size={16} />
            </div>
          )}
          
          <div className="flex-1 min-w-0 h-full flex flex-col">
            {/* Title - Fixed height */}
            <div className="h-6 flex items-center mb-1">
              <h3 className="font-semibold text-white truncate">
                {mod.displayName || mod.id}
              </h3>
            </div>
            
            {/* Category and Tags - Fixed height */}
            <div className="h-6 flex items-center flex-wrap gap-2 mb-1">
              {mod.category && (
                <span className={`${getCategoryColor(mod.category)} bg-opacity-10 text-xs px-2 py-0.5 rounded-full border`}>
                  {mod.category}
                </span>
              )}
              {mod.tags && mod.tags.length > 0 && (
                <>
                  {mod.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-cyber-pink bg-cyber-pink bg-opacity-10 text-xs px-2 py-0.5 rounded-full border border-cyber-pink">
                      {tag}
                    </span>
                  ))}
                  {mod.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{mod.tags.length - 3}</span>
                  )}
                </>
              )}
            </div>
            
            {/* Author and Version - Fixed height */}
            <div className="h-4 flex items-center space-x-3 mb-1">
              {mod.author && (
                <span className="text-xs text-gray-400">by {mod.author}</span>
              )}
              {mod.version && (
                <span className="text-xs text-gray-500">v{mod.version}</span>
              )}
            </div>
            
            {/* Description - Fixed height with ellipsis */}
            <div className="h-5 flex items-center">
              {mod.description ? (
                <p className="text-sm text-gray-400 truncate">{mod.description}</p>
              ) : (
                <div className="h-5"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 ml-4 mt-1">
          <button
            onClick={() => onViewFiles(mod.id)}
            className="text-gray-400 hover:text-cyber-blue transition-colors p-1"
            title="View mod files"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={() => onEdit(mod.id)}
            className="text-gray-400 hover:text-cyber-pink transition-colors p-1"
            title="Edit mod information"
          >
            <Edit3 size={16} />
          </button>
          
          <button
            onClick={() => onToggle(mod.id)}
            className={`p-2 rounded transition-all duration-200 ${
              isEnabled
                ? 'text-green-400 hover:text-green-300 bg-green-500 bg-opacity-20'
                : 'text-gray-400 hover:text-gray-300 bg-gray-600 bg-opacity-20'
            }`}
            title={isEnabled ? 'Disable mod' : 'Enable mod'}
          >
            <Power size={16} />
          </button>
          
          <button
            onClick={() => onDelete(mod.id)}
            className="text-gray-400 hover:text-red-400 transition-colors p-1"
            title="Delete mod"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // Only wrap in Draggable if the mod is enabled and drag is not disabled
  if (isEnabled && !isDragDisabled) {
    return (
      <Draggable draggableId={mod.id} index={index}>
        {(provided, snapshot) => (
                  <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            height: ITEM_HEIGHT,
            padding: '8px',
            paddingBottom: '12px',
            transform: snapshot.isDragging 
              ? provided.draggableProps.style?.transform 
              : 'none'
          }}
        >
          {cardContent}
        </div>
        )}
      </Draggable>
    );
  }

  return (
    <div style={{ height: ITEM_HEIGHT, padding: '8px', paddingBottom: '12px' }}>
      {cardContent}
    </div>
  );
});

const VirtualizedModList = ({ 
  mods, 
  enabledMods, 
  onToggleMod, 
  onEditMod, 
  onViewModFiles, 
  onDeleteMod 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and tags
  const { categories, tags } = useMemo(() => {
    const cats = new Set(['All']);
    const tgs = new Set(['All']);
    
    mods.forEach(mod => {
      if (mod.category) cats.add(mod.category);
      if (mod.tags) mod.tags.forEach(tag => tgs.add(tag));
    });
    
    return {
      categories: Array.from(cats),
      tags: Array.from(tgs)
    };
  }, [mods]);

  // Filter mods based on search and filters
  const filteredMods = useMemo(() => {
    return mods.filter(mod => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = (mod.displayName || mod.id).toLowerCase().includes(searchLower);
        const authorMatch = mod.author?.toLowerCase().includes(searchLower);
        const descMatch = mod.description?.toLowerCase().includes(searchLower);
        const tagMatch = mod.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!nameMatch && !authorMatch && !descMatch && !tagMatch) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategory && selectedCategory !== 'All' && mod.category !== selectedCategory) {
        return false;
      }
      
      // Tag filter
      if (selectedTag && selectedTag !== 'All') {
        if (!mod.tags || !mod.tags.includes(selectedTag)) {
          return false;
        }
      }
      
      return true;
    });
  }, [mods, searchTerm, selectedCategory, selectedTag]);

  // Separate enabled and disabled mods for display
  const enabledModsData = filteredMods.filter(mod => enabledMods.includes(mod.id));
  const disabledModsData = filteredMods.filter(mod => !enabledMods.includes(mod.id));

  const Row = useCallback(({ index, style }) => {
    const isInEnabledSection = index < enabledModsData.length;
    const mod = isInEnabledSection 
      ? enabledModsData[index] 
      : disabledModsData[index - enabledModsData.length];
    
    if (!mod) return null;
    
    const isEnabled = enabledMods.includes(mod.id);
    const actualIndex = isInEnabledSection ? index : index - enabledModsData.length;
    
    return (
      <div style={style}>
        <ModCard
          mod={mod}
          index={actualIndex}
          isEnabled={isEnabled}
          onToggle={onToggleMod}
          onEdit={onEditMod}
          onViewFiles={onViewModFiles}
          onDelete={onDeleteMod}
          isDragDisabled={!isEnabled}
        />
      </div>
    );
  }, [enabledModsData, disabledModsData, enabledMods, onToggleMod, onEditMod, onViewModFiles, onDeleteMod]);

  const totalItems = filteredMods.length;
  // Use a responsive height calculation
  const [containerHeight, setContainerHeight] = React.useState(600);
  
  React.useEffect(() => {
    const updateHeight = () => {
      // Calculate available height: viewport height minus header, search, and padding
      const availableHeight = window.innerHeight - 280; // Reserve space for header, search, padding
      const maxListHeight = Math.max(400, availableHeight); // Minimum 400px
      setContainerHeight(maxListHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const listHeight = containerHeight;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search and Filters - Fixed at top */}
      <div className="space-y-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search mods by name, author, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-blue focus:outline-none text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`cyber-button-secondary flex items-center space-x-2 ${showFilters ? 'bg-cyber-blue bg-opacity-20' : ''}`}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center space-x-4 p-3 bg-cyber-dark bg-opacity-50 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-cyber-dark border border-gray-600 rounded px-3 py-1 text-white text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Tag:</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-cyber-dark border border-gray-600 rounded px-3 py-1 text-white text-sm"
              >
                {tags.map(tag => (
                  <option key={tag} value={tag === 'All' ? '' : tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedTag('');
              }}
              className="text-sm text-gray-400 hover:text-cyber-blue underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-400 flex-shrink-0">
        Showing {filteredMods.length} of {mods.length} mods
        {enabledModsData.length > 0 && ` (${enabledModsData.length} enabled)`}
      </div>

      {/* Virtualized List - Fixed Height, Scrollable */}
      <div className="flex-1 min-h-0">
        {totalItems > 0 ? (
          <Droppable droppableId="enabled-mods" type="ENABLED_MOD">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="h-full">
                <List
                  height={listHeight}
                  itemCount={totalItems}
                  itemSize={ITEM_HEIGHT}
                  className="cyber-scrollbar"
                >
                  {Row}
                </List>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : (
          <div className="text-center py-12 text-gray-400 h-full flex flex-col justify-center">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>No mods found matching your criteria</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedModList;
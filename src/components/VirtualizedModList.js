import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, Power, GripVertical, Edit3, Tag, FolderOpen, Trash2, Search, Filter, ToggleLeft, ToggleRight, ArrowUpDown } from 'lucide-react';

const ITEM_HEIGHT = 130; // Height of each mod card including spacing

const ModCard = React.memo(({ mod, index, isEnabled, onToggle, onEdit, onViewFiles, onDelete, isDragDisabled, loadOrderPosition }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: mod.id,
    disabled: !isEnabled || isDragDisabled 
  });

  // Memoize button handlers to prevent recreation on every render
  const handleToggle = useCallback(() => onToggle(mod.id), [onToggle, mod.id]);
  const handleEdit = useCallback(() => onEdit(mod.id), [onEdit, mod.id]);
  const handleViewFiles = useCallback(() => onViewFiles(mod.id), [onViewFiles, mod.id]);
  const handleDelete = useCallback(() => onDelete(mod.id), [onDelete, mod.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
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
            <div className="text-gray-400 hover:text-gray-200 cursor-grab mt-1 flex flex-col items-center">
              <GripVertical size={16} />
              {loadOrderPosition && (
                <span className="text-xs text-cyber-blue font-bold bg-cyber-blue bg-opacity-20 px-1 rounded">
                  {loadOrderPosition}
                </span>
              )}
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
            onClick={handleViewFiles}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-cyber-blue transition-colors p-1"
            title="View mod files"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={handleEdit}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-cyber-pink transition-colors p-1"
            title="Edit mod information"
          >
            <Edit3 size={16} />
          </button>
          
          <button
            onClick={handleToggle}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
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
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-red-400 transition-colors p-1"
            title="Delete mod"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // Single wrapper div with conditional drag attributes
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        height: ITEM_HEIGHT,
        padding: '8px',
        paddingBottom: '12px',
      }}
      {...(isEnabled && !isDragDisabled ? { ...attributes, ...listeners } : {})}
    >
      {cardContent}
    </div>
  );
});

const VirtualizedModList = ({ 
  mods, 
  enabledMods, 
  modLoadOrder,
  onToggleMod, 
  onBulkToggleMods,
  onEditMod, 
  onViewModFiles, 
  onDeleteMod,
  onUpdateModLoadOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [sortBy, setSortBy] = useState('loadOrder');

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

  // Filter and sort mods based on search, filters, and sort option
  const filteredAndSortedMods = useMemo(() => {
    let filtered = mods.filter(mod => {
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

    // Apply sorting
    switch (sortBy) {
      case 'name':
        return [...filtered].sort((a, b) => 
          (a.displayName || a.id).localeCompare(b.displayName || b.id)
        );
      case 'category':
        return [...filtered].sort((a, b) => {
          const catA = a.category || 'Other';
          const catB = b.category || 'Other';
          if (catA === catB) {
            return (a.displayName || a.id).localeCompare(b.displayName || b.id);
          }
          return catA.localeCompare(catB);
        });
      case 'author':
        return [...filtered].sort((a, b) => {
          const authorA = a.author || 'Unknown';
          const authorB = b.author || 'Unknown';
          if (authorA === authorB) {
            return (a.displayName || a.id).localeCompare(b.displayName || b.id);
          }
          return authorA.localeCompare(authorB);
        });
      case 'loadOrder':
      default:
        // For load order, use the modLoadOrder to determine sequence
        const orderedMods = [];
        
        // Add mods in load order sequence (both enabled and disabled)
        modLoadOrder.forEach(id => {
          const mod = filtered.find(m => m.id === id);
          if (mod) orderedMods.push(mod);
        });
        
        // Add any remaining filtered mods that aren't in load order (new mods)
        filtered.forEach(mod => {
          if (!modLoadOrder.includes(mod.id)) {
            orderedMods.push(mod);
          }
        });
        
        return orderedMods;
    }
  }, [mods, searchTerm, selectedCategory, selectedTag, sortBy, enabledMods, modLoadOrder]);

  // Separate enabled and disabled mods for display
  const enabledModsData = filteredAndSortedMods.filter(mod => enabledMods.includes(mod.id));
  const disabledModsData = filteredAndSortedMods.filter(mod => !enabledMods.includes(mod.id));

  // Calculate counts for bulk actions
  const visibleEnabledCount = enabledModsData.length;
  const visibleDisabledCount = disabledModsData.length;
  const totalVisibleMods = filteredAndSortedMods.length;

  // Drag and drop sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // Handle drag end - only save if in load order mode
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Only actually save the reorder if we're in load order mode
    if (sortBy === 'loadOrder') {
      // Find the mods being reordered in the enabled mods data
      const oldIndex = enabledModsData.findIndex(mod => mod.id === active.id);
      const newIndex = enabledModsData.findIndex(mod => mod.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Create new order for enabled mods
        const reorderedEnabledMods = arrayMove(enabledModsData, oldIndex, newIndex);
        
        // Update the full load order by replacing the enabled portion
        const newLoadOrder = [
          ...reorderedEnabledMods.map(mod => mod.id),  // New enabled order
          ...modLoadOrder.filter(id => !enabledMods.includes(id))  // Keep disabled order unchanged
        ];
        
        onUpdateModLoadOrder(newLoadOrder);
      }
    }
    // If not in load order mode, drag will just revert visually
  };

  // Handle bulk enable all disabled mods
  const handleEnableAll = async () => {
    if (isEnabling || isDisabling) return;
    setIsEnabling(true);
    
    try {
      // Capture the disabled mods at the start to prevent array changes during operation
      const modsToEnable = [...disabledModsData];
      const modIds = modsToEnable.map(m => m.id);
      
      await onBulkToggleMods(modIds, true);
    } finally {
      setIsEnabling(false);
    }
  };

  // Handle bulk disable all enabled mods
  const handleDisableAll = async () => {
    if (isEnabling || isDisabling) return;
    setIsDisabling(true);
    
    try {
      // Capture the enabled mods at the start to prevent array changes during operation
      const modsToDisable = [...enabledModsData];
      const modIds = modsToDisable.map(m => m.id);
      
      await onBulkToggleMods(modIds, false);
    } finally {
      setIsDisabling(false);
    }
  };

  const Row = useCallback(({ index, style }) => {
    const isInEnabledSection = index < enabledModsData.length;
    const mod = isInEnabledSection 
      ? enabledModsData[index] 
      : disabledModsData[index - enabledModsData.length];
    
    if (!mod) return null;
    
    const isEnabled = enabledMods.includes(mod.id);
    const actualIndex = isInEnabledSection ? index : index - enabledModsData.length;
    
    // Disable drag if not in load order mode or mod is disabled
    const isDragDisabled = !isEnabled || sortBy !== 'loadOrder';
    
    // Get load order position (1-based index in modLoadOrder)
    const loadOrderPosition = modLoadOrder.indexOf(mod.id) + 1;
    const displayPosition = loadOrderPosition > 0 ? loadOrderPosition : null;
    
    return (
      <div style={style}>
        <ModCard
          key={`${mod.id}-${isEnabled}`} // Force re-render when enabled state changes
          mod={mod}
          index={actualIndex}
          isEnabled={isEnabled}
          onToggle={onToggleMod}
          onEdit={onEditMod}
          onViewFiles={onViewModFiles}
          onDelete={onDeleteMod}
          isDragDisabled={isDragDisabled}
          loadOrderPosition={displayPosition}
        />
      </div>
    );
  }, [enabledModsData, disabledModsData, enabledMods, onToggleMod, onEditMod, onViewModFiles, onDeleteMod, sortBy, modLoadOrder]);

  const totalItems = filteredAndSortedMods.length;
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
          
          <div className="flex items-center space-x-2">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-cyber-dark border border-gray-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="loadOrder">Load Order</option>
              <option value="name">Name A-Z</option>
              <option value="category">Category</option>
              <option value="author">Author</option>
            </select>
          </div>
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

      {/* Results Summary and Bulk Actions */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="text-sm text-gray-400">
          Showing {filteredAndSortedMods.length} of {mods.length} mods
          {enabledModsData.length > 0 && ` (${enabledModsData.length} enabled)`}
          {sortBy !== 'loadOrder' && (
            <span className="ml-2 text-cyber-yellow">
              • Sorted by {sortBy === 'name' ? 'Name' : sortBy === 'category' ? 'Category' : 'Author'}
              {sortBy !== 'loadOrder' && ' (drag disabled)'}
            </span>
          )}
        </div>
        
        {/* Bulk Action Buttons */}
        {totalVisibleMods > 0 && (visibleDisabledCount > 0 || visibleEnabledCount > 0) && (
          <div className="flex items-center space-x-2">
            {/* Enable All Button */}
            {visibleDisabledCount > 0 && (
              <button
                onClick={handleEnableAll}
                disabled={isEnabling || isDisabling}
                className={`cyber-button hover:bg-green-500 hover:bg-opacity-20 hover:border-green-400 flex items-center space-x-2 text-sm transition-all duration-200 ${
                  (isEnabling || isDisabling) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={`Enable all disabled mods (${visibleDisabledCount} mods)`}
              >
                {isEnabling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400" />
                ) : (
                  <ToggleRight size={16} className="text-green-400" />
                )}
                <span>{isEnabling ? 'Enabling...' : 'Enable All'}</span>
                <span className="text-xs text-gray-400">({visibleDisabledCount})</span>
              </button>
            )}

            {/* Disable All Button */}
            {visibleEnabledCount > 0 && (
              <button
                onClick={handleDisableAll}
                disabled={isEnabling || isDisabling}
                className={`cyber-button-secondary hover:bg-red-500 hover:bg-opacity-20 hover:border-red-400 flex items-center space-x-2 text-sm transition-all duration-200 ${
                  (isEnabling || isDisabling) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={`Disable all enabled mods (${visibleEnabledCount} mods)`}
              >
                {isDisabling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                ) : (
                  <ToggleLeft size={16} className="text-red-400" />
                )}
                <span>{isDisabling ? 'Disabling...' : 'Disable All'}</span>
                <span className="text-xs text-gray-400">({visibleEnabledCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Virtualized List - Fixed Height, Scrollable */}
      <div className="flex-1 min-h-0">
        {totalItems > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={enabledModsData.map(mod => mod.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="h-full">
                <List
                  height={listHeight}
                  itemCount={totalItems}
                  itemSize={ITEM_HEIGHT}
                  className="cyber-scrollbar"
                >
                  {Row}
                </List>
              </div>
            </SortableContext>
          </DndContext>
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
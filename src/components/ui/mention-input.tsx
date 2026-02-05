import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Card } from './card';

interface MentionOption {
  id: string;
  name: string;
  role: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionSelect: (mention: MentionOption) => void;
  mentions: MentionOption[];
  placeholder?: string;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  onMentionSelect,
  mentions,
  placeholder,
  className
}: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [filteredMentions, setFilteredMentions] = useState<MentionOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = mentions.filter(mention =>
      mention.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      mention.role.toLowerCase().includes(mentionQuery.toLowerCase())
    );
    setFilteredMentions(filtered);
    setSelectedIndex(0);
  }, [mentionQuery, mentions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for @ symbol
    const cursorPos = e.target.selectionStart || 0;
    const textUpToCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textUpToCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textUpToCursor.slice(lastAtIndex + 1);
      // Only show mentions if there's no space after @
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        return;
      }
    }
    
    setShowMentions(false);
    setMentionQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions || filteredMentions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredMentions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredMentions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredMentions[selectedIndex]) {
          selectMention(filteredMentions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowMentions(false);
        break;
    }
  };

  const selectMention = (mention: MentionOption) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textUpToCursor = value.slice(0, cursorPos);
    const lastAtIndex = textUpToCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeAt = value.slice(0, lastAtIndex);
      const afterCursor = value.slice(cursorPos);
      const newValue = `${beforeAt}@${mention.name}${afterCursor}`;
      onChange(newValue);
      onMentionSelect(mention);
    }
    
    setShowMentions(false);
    setMentionQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showMentions && filteredMentions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto">
          <div className="p-1">
            {filteredMentions.map((mention, index) => (
              <Button
                key={mention.id}
                variant={index === selectedIndex ? "secondary" : "ghost"}
                className="w-full justify-start text-left h-auto py-2 px-3"
                onClick={() => selectMention(mention)}
              >
                <div>
                  <div className="font-medium">{mention.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {mention.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
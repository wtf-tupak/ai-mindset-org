const fs = require('fs').promises;
const path = require('path');

class MemoryManager {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || path.join(__dirname, '../..');
    this.memoryDir = path.join(this.projectRoot, 'memory');
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = options.cacheDuration || 300000; // 5 minutes
  }

  async getMemoriesByType(type) {
    const memories = await this.loadMemories();
    return memories.filter(m => m.type === type);
  }

  async searchMemories(query) {
    const memories = await this.loadMemories();
    const lowerQuery = query.toLowerCase();

    return memories.filter(m => {
      const searchText = `${m.name} ${m.description} ${m.content}`.toLowerCase();
      return searchText.includes(lowerQuery);
    });
  }

  async addMemory(content, type, name, description) {
    const filename = `${type}_${name.replace(/\s+/g, '-').toLowerCase()}.md`;
    const filepath = path.join(this.memoryDir, filename);

    const frontmatter = `---
name: ${name}
description: ${description}
type: ${type}
created: ${new Date().toISOString()}
---

${content}
`;

    await fs.writeFile(filepath, frontmatter, 'utf-8');

    // Update MEMORY.md index
    await this.updateMemoryIndex(filename, name, description);

    // Clear cache
    this.clearCache();

    return { success: true, filepath };
  }

  async updateMemoryIndex(filename, name, description) {
    const memoryIndexPath = path.join(this.projectRoot, 'MEMORY.md');

    try {
      let content = await fs.readFile(memoryIndexPath, 'utf-8');
      const entry = `- [${name}](memory/${filename}) — ${description}\n`;

      // Append to end of file
      content += entry;

      await fs.writeFile(memoryIndexPath, content, 'utf-8');
    } catch (error) {
      console.error('Error updating MEMORY.md index:', error);
    }
  }

  async loadMemories() {
    // Check cache
    if (this.cache && this.cacheTime && Date.now() - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }

    try {
      // Check if memory directory exists
      try {
        await fs.access(this.memoryDir);
      } catch {
        console.log('Memory directory does not exist yet');
        return [];
      }

      const files = await fs.readdir(this.memoryDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      const memories = await Promise.all(
        mdFiles.map(async (file) => {
          try {
            const filepath = path.join(this.memoryDir, file);
            const content = await fs.readFile(filepath, 'utf-8');
            const parsed = this.parseMemoryFile(content, file);
            return parsed;
          } catch (error) {
            console.error(`Error reading memory file ${file}:`, error);
            return null;
          }
        })
      );

      const validMemories = memories.filter(m => m !== null);

      // Cache result
      this.cache = validMemories;
      this.cacheTime = Date.now();

      return validMemories;
    } catch (error) {
      console.error('Error loading memories:', error);
      return [];
    }
  }

  parseMemoryFile(content, filename) {
    const frontmatterMatch = content.match(/^---\s+([\s\S]*?)\s+---\s+([\s\S]*)$/);

    if (!frontmatterMatch) {
      return {
        filename,
        name: filename.replace('.md', ''),
        description: '',
        type: 'unknown',
        content: content,
        created: null
      };
    }

    const frontmatter = frontmatterMatch[1];
    const body = frontmatterMatch[2];

    const metadata = {};
    const lines = frontmatter.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        metadata[match[1]] = match[2].trim();
      }
    }

    return {
      filename,
      name: metadata.name || filename.replace('.md', ''),
      description: metadata.description || '',
      type: metadata.type || 'unknown',
      content: body.trim(),
      created: metadata.created || null
    };
  }

  async getMemoryByName(name) {
    const memories = await this.loadMemories();
    return memories.find(m => m.name === name);
  }

  async deleteMemory(name) {
    const memory = await this.getMemoryByName(name);
    if (!memory) {
      return { success: false, error: 'Memory not found' };
    }

    const filepath = path.join(this.memoryDir, memory.filename);

    try {
      await fs.unlink(filepath);
      this.clearCache();
      return { success: true };
    } catch (error) {
      console.error('Error deleting memory:', error);
      return { success: false, error: error.message };
    }
  }

  async getRelevantMemories(context, limit = 5) {
    const memories = await this.loadMemories();

    // Simple relevance scoring based on keyword matching
    const scored = memories.map(m => {
      let score = 0;
      const searchText = `${m.name} ${m.description} ${m.content}`.toLowerCase();
      const contextWords = context.toLowerCase().split(/\s+/);

      for (const word of contextWords) {
        if (word.length > 3 && searchText.includes(word)) {
          score++;
        }
      }

      return { memory: m, score };
    });

    // Sort by score and return top N
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.memory);
  }

  clearCache() {
    this.cache = null;
    this.cacheTime = null;
  }
}

module.exports = MemoryManager;

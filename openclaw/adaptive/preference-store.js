const fs = require('fs');
const path = require('path');

class PreferenceStore {
  constructor() {
    this.preferences = new Map();
    this.storePath = path.join(__dirname, '../data/preferences.json');
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.storePath)) {
        const data = fs.readFileSync(this.storePath, 'utf8');
        const parsed = JSON.parse(data);
        this.preferences = new Map(Object.entries(parsed));
        console.log(`Loaded ${this.preferences.size} preferences`);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  save() {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = Object.fromEntries(this.preferences);
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2));
      console.log('Preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  set(userId, key, value, weight = 1.0) {
    const userKey = `${userId}:${key}`;

    const preference = {
      userId,
      key,
      value,
      weight,
      updatedAt: new Date(),
      count: (this.preferences.get(userKey)?.count || 0) + 1
    };

    this.preferences.set(userKey, preference);
    this.save();
  }

  get(userId, key, defaultValue = null) {
    const userKey = `${userId}:${key}`;
    const pref = this.preferences.get(userKey);
    return pref ? pref.value : defaultValue;
  }

  increment(userId, key, amount = 1) {
    const current = this.get(userId, key, 0);
    this.set(userId, key, current + amount);
  }

  decrement(userId, key, amount = 1) {
    const current = this.get(userId, key, 0);
    this.set(userId, key, Math.max(0, current - amount));
  }

  getUserPreferences(userId) {
    const userPrefs = {};
    for (const [key, pref] of this.preferences.entries()) {
      if (pref.userId === userId) {
        userPrefs[pref.key] = pref.value;
      }
    }
    return userPrefs;
  }

  decay(decayFactor = 0.95, maxAge = 2592000000) { // 30 days
    const now = Date.now();
    let decayed = 0;

    for (const [key, pref] of this.preferences.entries()) {
      const age = now - new Date(pref.updatedAt).getTime();

      if (age > maxAge) {
        // Remove very old preferences
        this.preferences.delete(key);
        decayed++;
      } else {
        // Decay weight
        pref.weight *= decayFactor;
        if (pref.weight < 0.1) {
          this.preferences.delete(key);
          decayed++;
        }
      }
    }

    if (decayed > 0) {
      console.log(`Decayed ${decayed} preferences`);
      this.save();
    }
  }

  getStats() {
    return {
      total: this.preferences.size,
      byUser: this.groupByUser()
    };
  }

  groupByUser() {
    const byUser = {};
    for (const pref of this.preferences.values()) {
      if (!byUser[pref.userId]) {
        byUser[pref.userId] = 0;
      }
      byUser[pref.userId]++;
    }
    return byUser;
  }
}

module.exports = PreferenceStore;

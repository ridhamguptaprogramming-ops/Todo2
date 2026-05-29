const { db } = require('../config/firebase');

const models = {
  createdBy: () => require('./User'),
  userId: () => require('./User'),
  eventId: () => require('./Event')
};

const toDate = (value) => {
  if (value && typeof value.toDate === 'function') return value.toDate();
  return value;
};

const normalizeValue = (value) => {
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalizeValue(toDate(nested))])
    );
  }
  return toDate(value);
};

const cleanForFirestore = (value) => {
  if (Array.isArray(value)) return value.map(cleanForFirestore);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nested]) => nested !== undefined)
        .map(([key, nested]) => [key, cleanForFirestore(nested)])
    );
  }
  return value;
};

const matchesCondition = (value, condition) => {
  if (condition && typeof condition === 'object' && !(condition instanceof Date) && !Array.isArray(condition)) {
    if ('$ne' in condition && value === condition.$ne) return false;
    if ('$gt' in condition && new Date(value).getTime() <= new Date(condition.$gt).getTime()) return false;
    if ('$regex' in condition) {
      const flags = condition.$options || '';
      return new RegExp(condition.$regex, flags).test(String(value || ''));
    }
    return true;
  }

  return value === condition;
};

const matchesQuery = (item, query = {}) => {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$or') {
      return condition.some((nestedQuery) => matchesQuery(item, nestedQuery));
    }

    return matchesCondition(item[key], condition);
  });
};

class FirestoreQuery {
  constructor(Model, { id, query = {}, single = false } = {}) {
    this.Model = Model;
    this.id = id;
    this.query = query;
    this.single = single;
    this.populateFields = [];
    this.sortSpec = null;
    this.limitCount = null;
    this.selectSpec = null;
  }

  populate(field) {
    this.populateFields.push(field);
    return this;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  select(spec) {
    this.selectSpec = spec;
    return this;
  }

  async exec() {
    let results = [];

    if (this.id) {
      const doc = await this.Model.collection().doc(this.id).get();
      results = doc.exists ? [this.Model.fromDoc(doc)] : [];
    } else {
      const snapshot = await this.Model.collection().get();
      results = snapshot.docs
        .map((doc) => this.Model.fromDoc(doc))
        .filter((item) => matchesQuery(item, this.query));
    }

    if (this.sortSpec) {
      const [[field, direction]] = Object.entries(this.sortSpec);
      results.sort((a, b) => {
        const left = new Date(a[field]).getTime() || a[field] || 0;
        const right = new Date(b[field]).getTime() || b[field] || 0;
        return direction < 0 ? right - left : left - right;
      });
    }

    if (this.limitCount) results = results.slice(0, this.limitCount);

    for (const field of this.populateFields) {
      const getModel = models[field];
      if (!getModel) continue;

      const RelatedModel = getModel();
      await Promise.all(results.map(async (item) => {
        if (!item[field] || typeof item[field] === 'object') return;
        item[field] = await RelatedModel.findById(item[field]);
      }));
    }

    const output = this.single ? results[0] || null : results;
    return this.applySelect(output);
  }

  applySelect(output) {
    if (!this.selectSpec || !String(this.selectSpec).startsWith('-')) return output;
    const fields = String(this.selectSpec).split(/\s+/).map((field) => field.replace(/^-/, ''));
    const hideFields = (item) => {
      if (!item) return item;
      fields.forEach((field) => delete item[field]);
      return item;
    };

    return Array.isArray(output) ? output.map(hideFields) : hideFields(output);
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

class FirestoreModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static collection() {
    return db.collection(this.collectionName);
  }

  static fromDoc(doc) {
    return new this({
      _id: doc.id,
      id: doc.id,
      ...normalizeValue(doc.data())
    });
  }

  static find(query = {}) {
    return new FirestoreQuery(this, { query });
  }

  static findOne(query = {}) {
    return new FirestoreQuery(this, { query, single: true });
  }

  static findById(id) {
    return new FirestoreQuery(this, { id, single: true });
  }

  static async create(data) {
    const instance = new this(data);
    await instance.save();
    return instance;
  }

  static async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }

  static async findByIdAndUpdate(id, update = {}) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const next = { ...existing, ...update };
    if (update.$inc) {
      Object.entries(update.$inc).forEach(([field, increment]) => {
        next[field] = (existing[field] || 0) + increment;
      });
      delete next.$inc;
    }

    Object.assign(existing, next);
    await existing.save();
    return existing;
  }

  static async findByIdAndDelete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;
    await this.collection().doc(id).delete();
    return existing;
  }

  async save() {
    const now = new Date();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    const data = { ...this };
    delete data.id;
    delete data._id;

    if (this._id) {
      await this.constructor.collection().doc(this._id).set(cleanForFirestore(data), { merge: true });
    } else {
      const doc = await this.constructor.collection().add(cleanForFirestore(data));
      this._id = doc.id;
      this.id = doc.id;
    }

    return this;
  }
}

module.exports = FirestoreModel;

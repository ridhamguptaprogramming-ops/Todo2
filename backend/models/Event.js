const FirestoreModel = require('./firestoreModel');

class Event extends FirestoreModel {
  static collectionName = 'events';

  constructor(data = {}) {
    super({
      registered: 0,
      attended: 0,
      category: 'conference',
      status: 'draft',
      tags: [],
      speakers: [],
      ...data
    });
  }
}

module.exports = Event;

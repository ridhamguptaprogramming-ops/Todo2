const FirestoreModel = require('./firestoreModel');

class Attendance extends FirestoreModel {
  static collectionName = 'attendance';

  constructor(data = {}) {
    super({
      status: 'registered',
      registeredAt: new Date(),
      ...data
    });
  }
}

module.exports = Attendance;

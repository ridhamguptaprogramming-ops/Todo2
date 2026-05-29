const bcrypt = require('bcryptjs');
const FirestoreModel = require('./firestoreModel');

class User extends FirestoreModel {
  static collectionName = 'users';

  constructor(data = {}) {
    super({
      isVerified: false,
      role: 'user',
      ...data
    });
  }

  async save() {
    if (this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.email) this.email = this.email.toLowerCase();
    return super.save();
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
  }
}

module.exports = User;

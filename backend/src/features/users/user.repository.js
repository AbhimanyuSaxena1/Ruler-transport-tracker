import User from './user.model.js';

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findByEmail(email, includePassword = false, includeRefreshToken = false) {
    let query = User.findOne({ email });
    if (includePassword) {
      query = query.select('+password');
    }
    if (includeRefreshToken) {
      query = query.select('+refreshToken');
    }
    return query.exec();
  }

  async findById(id, includeRefreshToken = false) {
    let query = User.findById(id).populate('assignedBus', 'busNumber licensePlate status');
    if (includeRefreshToken) {
      query = query.select('+refreshToken');
    }
    return query.exec();
  }

  async updateRefreshToken(userId, hashedRefreshToken) {
    return User.findByIdAndUpdate(
      userId,
      { refreshToken: hashedRefreshToken },
      { new: true }
    ).exec();
  }

  async clearRefreshToken(userId) {
    return User.findByIdAndUpdate(
      userId,
      { refreshToken: null },
      { new: true }
    ).exec();
  }

  async assignBus(driverId, busId) {
    return User.findByIdAndUpdate(
      driverId,
      { assignedBus: busId },
      { new: true }
    ).exec();
  }

  async findDrivers() {
    return User.find({ role: 'driver' }).populate('assignedBus', 'busNumber licensePlate').exec();
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id).exec();
  }
}

export default new UserRepository();

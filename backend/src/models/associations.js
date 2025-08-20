import User from './User.js';
import Cabin from './Cabin.js';
import Reservation from './Reservation.js';
import Availability from './Availability.js';
import Review from './Review.js';

// Asociaciones User - Reservation
User.hasMany(Reservation, { foreignKey: 'user_id' });
Reservation.belongsTo(User, { foreignKey: 'user_id' });

// Asociaciones Cabin - Reservation
Cabin.hasMany(Reservation, { foreignKey: 'cabin_id' });
Reservation.belongsTo(Cabin, { foreignKey: 'cabin_id' });

// Asociaciones Cabin - Availability
Cabin.hasMany(Availability, { foreignKey: 'cabin_id' });
Availability.belongsTo(Cabin, { foreignKey: 'cabin_id' });

// Asociaciones User - Review
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Asociaciones Reservation - Review
Reservation.hasOne(Review, { foreignKey: 'reservation_id' });
Review.belongsTo(Reservation, { foreignKey: 'reservation_id' });

// Asociaciones Cabin - Review
Cabin.hasMany(Review, { foreignKey: 'cabin_id' });
Review.belongsTo(Cabin, { foreignKey: 'cabin_id' });

export { User, Cabin, Reservation, Availability, Review };
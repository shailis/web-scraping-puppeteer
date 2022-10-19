module.exports = (sequelize, Sequelize) => {
  const DataTypes = Sequelize.DataTypes;
  const Bike = sequelize.define(
    'Bike',
    {
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      electric: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      brand: {
        type: DataTypes.STRING(40),
      },
      model: {
        type: DataTypes.STRING(100),
      },
      year: {
        type: DataTypes.STRING(4),
      },
      image: {
        type: DataTypes.STRING(200),
      },
      price: {
        type: DataTypes.STRING(20),
      },
      category: {
        type: DataTypes.STRING(40),
      },
      wheels: {
        type: DataTypes.STRING(40),
      },
      frame: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      suspensionFork: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      rearShock: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      rearDerailleur: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      frontDerailleur: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      shiftLevers: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      cassette: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      crank: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      bottomBracket: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      chain: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      pedals: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      chainGuide: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      rims: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      tires: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      frontHub: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      rearHub: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      spokes: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      brakes: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      brakeLevers: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      diskRotors: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      stem: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      handlebar: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      grips: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      headset: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      saddle: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      seatpost: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      motor: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      battery: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      remote: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      charger: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
    },
    { timestamps: false, tableName: 'bikes' }
  );

  return Bike;
};

const Base = require('./base/base')

class CarCategory extends Base {
  constructor({ id, name, carsIds, price }) {
    super({ id, name });
    
    this.carsIds = carsIds
    this.price = price
  }
}

module.exports = CarCategory
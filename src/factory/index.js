const CarService = require('./../service/carService')
const { join } = require('path')

const carsDatabase = join(__dirname, './../../database', 'cars.json')
const carService = new CarService({
  cars: carsDatabase
})

module.exports = carService
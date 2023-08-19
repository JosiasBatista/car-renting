const { describe, it, after, before } = require('mocha')
const supertest = require('supertest')
const assert = require('assert')
const sinon = require('sinon')
const Transaction = require('./entities/transaction')
const CarService = require('./service/carService')
const { expect } = require('chai')

const mocks = {
  validCar: require('./../test/mocks/valid-car.json'),
  category: require('./../test/mocks/valid-carCategory.json'),
  customer: require('./../test/mocks/valid-customer.json')
}

describe('API Suite test', () => {
  let app
  let carService = {}
  
  before((done) => {
    const { app: application, carService: instantiatedService } = require('./api')
  
    carService = instantiatedService
    app = application
    app.once('listening', done)
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(done => app.close(done))

  describe('/carInCategory:post', () => {
    it('should search for a car in a valid category and return HTTP Status 200', async () => {
      const car = mocks.validCar;

      sandbox.stub(
        carService.carRepository,
        carService.carRepository.find.name,
      ).resolves(car)

      const response = await supertest(app).post('/carInCategory')
        .send(mocks.category)
        .expect(200)

      assert.match(response.text, /PT Cruiser/)
    })

    it('should search for a car with an invalid category and return HTTP Status 403', async () => {
      const categoryValues = Object.create(mocks.category)
      delete categoryValues.id

      const response = await supertest(app).post('/carInCategory')
        .send(categoryValues)
        .expect(403)

      assert.strictEqual(response.text, 'Falha ao recuperar carro!')
    })

    it('should search for a car in a empty category and return HTTP Status 500', async () => {
      sandbox.stub(
        carService.carRepository,
        carService.carRepository.find.name,
      ).resolves(undefined)

      const response = await supertest(app).post('/carInCategory')
        .send(mocks.category)
        .expect(500)

      assert.strictEqual(response.text, 'Falha ao recuperar carro!')
    })
  })

  describe('/rentCar:post', () => {
    it('should request for a rent and receive the renting information HTTP Status 200', async () => {
      supertest(app).post('/rentCar')
        .send({
          category: mocks.category,
          customer: mocks.customer,
          numberOfDays: 5
        })
        .expect(200)
    })

    it('should request for a rent with 5 rent days, client with age 32 and 65.83 car value and receive rent value of 427,90', async () => {
      const response = await supertest(app).post('/rentCar')
        .send({
          category: mocks.category,
          customer: mocks.customer,
          numberOfDays: 5
        })
        .expect(200)

      const responseJson = JSON.parse(response.text)
      const value = carService.currencyFormat.format(427.895)

      assert.equal(responseJson.amount, value)
    })

    it('should request for a rent without a number of days and receive HTTP Status 403', async () => {
      const response = await supertest(app).post('/rentCar')
        .send({
          category: mocks.category,
          customer: mocks.customer
        })
        .expect(403)

      assert.strictEqual(response.text, 'Falha ao realizar aluguel!')
    })

    it('should request for a rent and receive HTTP Status 500 when the renting info do not return', async () => {
      sandbox.stub(
        CarService.prototype,
        'rent'
      ).resolves(undefined)

      const response = await supertest(app).post('/rentCar')
        .send({
          category: mocks.category,
          customer: mocks.customer,
          numberOfDays: 5
        })
        .expect(500)

      assert.strictEqual(response.text, 'Falha ao realizar aluguel!')
    })
  })

  describe('/defaultRoute', () => {
    it('should request a nonexistent route and receive a 404', async () => {
      const response = await supertest(app)
        .get('/hi')
        .expect(404)

      assert.strictEqual(response.text, 'Endpoint não encontrado!')
    })
  })
})
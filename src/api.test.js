const { describe, it, after, before } = require('mocha')
const supertest = require('supertest')
const assert = require('assert')
const sinon = require('sinon')
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
    carService = require('./factory')
    app = require('./api')

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

  describe('/calculateFinalPrice:post', () => {
    it('given a carCategory, customer and numberOfDays it should calculate final amount in real', async () => {
      const customer = {
        ...mocks.customer,
        age: 50
      }

      const carCategory = {
        ...mocks.category,
        price: 37.6
      }

      const numberOfDays = 5

      const body = {
        customer,
        carCategory,
        numberOfDays
      }

      const expected = carService.currencyFormat.format(244.40)

      const response = await supertest(app)
        .post('/calculateFinalPrice')
        .send(body)
        .expect(200)

      const { price } = JSON.parse(response.text)
      assert.equal(price, expected)
    })

    it('given a carCategory, customer and do not passing a numberOfDays it should return 403 error', async () => {
      const customer = {
        ...mocks.customer,
        age: 50
      }

      const carCategory = {
        ...mocks.category,
        price: 37.6
      }

      const body = {
        customer,
        carCategory
      }

      const response = await supertest(app)
        .post('/calculateFinalPrice')
        .send(body)
        .expect(403)
      
      assert.strictEqual(response.text, 'Falha ao calcular preço!')
    })

    it('given an invalid carCategory it should return 403 error', async () => {
      const customer = {
        ...mocks.customer,
        age: 50
      }

      const carCategory = Object.create(mocks.category)
      carCategory.price = undefined

      const body = {
        customer,
        carCategory,
        numberOfDays: 5
      }

      const response = await supertest(app)
        .post('/calculateFinalPrice')
        .send(body)
        .expect(403)
      
      assert.strictEqual(response.text, 'Falha ao calcular preço!')
    })

    it('given an invalid customer age it should return 500 error', async () => {
      const customer = {
        ...mocks.customer,
        age: 12
      }

      const carCategory = {...mocks.category,
        price: 37.6
      }

      const body = {
        customer,
        carCategory,
        numberOfDays: 5
      }

      const response = await supertest(app)
        .post('/calculateFinalPrice')
        .send(body)
        .expect(500)
      
      assert.strictEqual(response.text, 'Falha ao calcular preço!')
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
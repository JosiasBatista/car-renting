const { once } = require('events')
const http = require('http')
const CarService = require('./service/carService')
const { join } = require('path')

const carsDatabase = join(__dirname, './../database', 'cars.json')
const carService = new CarService({
  cars: carsDatabase
})

const routes = {
  '/carincategory:post': async (request, response) => {
    const category = JSON.parse(await once(request, "data"))

    if (!category.id || category.carsIds?.length === 0) {
      response.writeHead(403)
      response.end("Falha ao recuperar carro!")
      return
    }

    const car = await carService.getAvailableCar(category)

    if (car === undefined) {
      response.writeHead(500)
      response.end("Falha ao recuperar carro!")
      return
    }

    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.write(JSON.stringify(car))
    return response.end()
  },
  '/rentcar:post': async (request, response) => {
    const bodyRequest = JSON.parse(await once(request, "data"))

    const carCategory = bodyRequest.category
    const customer = bodyRequest.customer
    const numberOfDasy = bodyRequest.numberOfDays

    if (!carCategory || !customer || !numberOfDasy) {
      response.writeHead(403)
      response.end("Falha ao realizar aluguel!")
      return
    }

    const rent = await carService.rent(customer, carCategory, numberOfDasy)

    if (!rent) {
      response.writeHead(500)
      response.end("Falha ao realizar aluguel!")
      return
    }
    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.write(JSON.stringify(rent))
    return response.end()
  },
  default(request, response) {
    response.writeHead(404)
    return response.end('Endpoint não encontrado!')
  }
}

function handler(request, response) {
  const { url, method }= request
  const routeKey = `${url.toLowerCase()}:${method.toLowerCase()}`

  const chosen = routes[routeKey] || routes.default

  return chosen(request, response)
}

const app = http.createServer(handler)
.listen(3000, () => console.log('running at 3000'))

module.exports = {
  carService,
  app
}
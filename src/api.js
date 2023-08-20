const { once } = require('events')
const http = require('http')

const carService = require('./factory')

const validations = {
  category: (categoryReq) => {
    return (
      categoryReq &&
      categoryReq.id &&
      categoryReq.carsIds &&
      categoryReq.carsIds.length > 0
    )
  },
  customer: (customerReq) => {
    return (
      customerReq &&
      customerReq.age
    )
  },
  numberOfDays: (numberOfDaysReq) => {
    return (
      numberOfDaysReq &&
      numberOfDaysReq > 0
    )
  }
}

const routes = {
  '/carInCategory:post': async (request, response) => {
    const category = JSON.parse(await once(request, "data"))

    if (!validations.category(category)) {
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
  '/rentCar:post': async (request, response) => {
    const bodyRequest = JSON.parse(await once(request, "data"))

    const carCategory = bodyRequest.category
    const customer = bodyRequest.customer
    const numberOfDays = bodyRequest.numberOfDays

    if (
      !validations.category(carCategory) || 
      !validations.customer(customer) ||
      !validations.numberOfDays(numberOfDays)
    ) {
      response.writeHead(403)
      response.end("Falha ao realizar aluguel!")
      return
    }

    const rent = await carService.rent(customer, carCategory, numberOfDays)

    if (!rent) {
      response.writeHead(500)
      response.end("Falha ao realizar aluguel!")
      return
    }

    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.write(JSON.stringify(rent))
    return response.end()
  },
  '/calculateFinalPrice:post': async (request, response) => {
    for await (const data of request) {
      const { customer, carCategory, numberOfDays } = JSON.parse(data)

      if (
        !validations.category(carCategory) || 
        !validations.customer(customer) ||
        !validations.numberOfDays(numberOfDays)
      ) {
        response.writeHead(403)
        response.end("Falha ao calcular preço!")
        return
      }

      try {
        const result = carService.calculateFinalPrice(customer, carCategory, numberOfDays)

        response.writeHead(200, {'Content-Type': 'text/plain'})
        response.write(JSON.stringify({ price: result }))
        return response.end()
      } catch (error) {
        console.log('error', error)

        response.writeHead(500)
        response.end("Falha ao calcular preço!")
      }
    }
  },
  default(request, response) {
    response.writeHead(404)
    return response.end('Endpoint não encontrado!')
  }
}

function handler(request, response) {
  const { url, method }= request
  const routeKey = `${url}:${method.toLowerCase()}`

  const chosen = routes[routeKey] || routes.default

  return chosen(request, response)
}

const app = http.createServer(handler)
.listen(3000, () => console.log('running at 3000'))

module.exports = app

# Car Renting
Car renting API developed in JavaScript using the TDD practice to learn more about testing and how to use the best and advanced techniques of JavaScript to build systems.

The tests are independent from the database and connections, making the tests isolated using stubs and mocks to ensure that the functionalities are working as expected.

## Features
This API has 3 different endpoints:
 - POST: /carInCategory
   - This endpoint return a random car from the category passed in the request
 - POST: /rentCar
   - This endpoint can be used to rent a car and return a Transaction with all the renting informations
 - POST: /calculateFinalPrice
   - This endpoint can be used to calculate the price of a possible renting using the category, customer and amount of rent days in the calculation

## Tests
This project had two diffent types of tests: Unit tests and E2E tests.
Both of them can be executed running the command: **npm run test**

To check the 100% coverage of this project you just need to run: **npm run test:cov**

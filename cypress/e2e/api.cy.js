import { faker } from '@faker-js/faker';

describe('Testes de API - Automation Exercise', () => {
  const baseUrl = 'https://automationexercise.com/api';

  it('Deve validar o endpoint GET All Products List (Status e Contrato)', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/productsList`,
    }).then((response) => {
      // Validação de Status
      expect(response.status).to.eq(200);

      // A API retorna um HTML que contém o JSON. Precisamos fazer o parse.
      const body = JSON.parse(response.body);
      
      // Validação do Contrato / Schema principal
      expect(body).to.have.property('responseCode', 200);
      expect(body).to.have.property('products').that.is.an('array');
      
      // Validando a estrutura (chaves) do primeiro produto do array
      expect(body.products[0]).to.have.all.keys(
        'id', 'name', 'price', 'brand', 'category'
      );
    });
  });

  it('Deve criar um usuário dinâmico via POST', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/createAccount`,
      form: true, // O site usa form-urlencoded para o POST
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        title: 'Mr',
        birth_date: '10',
        birth_month: 'May',
        birth_year: '1990',
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        company: faker.company.name(),
        address1: faker.location.streetAddress(),
        address2: faker.location.secondaryAddress(),
        country: 'United States',
        zipcode: faker.location.zipCode(),
        state: faker.location.state(),
        city: faker.location.city(),
        mobile_number: faker.phone.number()
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      
      const body = JSON.parse(response.body);
      expect(body.responseCode).to.eq(201); // 201 Created
      expect(body.message).to.eq('User created!');
    });
  });
});
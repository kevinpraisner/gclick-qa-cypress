import { faker } from '@faker-js/faker';

describe('Testes de API - Automation Exercise', () => {
  const baseUrl = 'https://automationexercise.com/api';

  it('Deve validar o endpoint GET All Products List (Status e Contrato)', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/productsList`,
    }).then((response) => {
      // Validação de Status HTTP
      expect(response.status).to.eq(200);

      // A API retorna um HTML que contém o JSON
      const body = JSON.parse(response.body);

      // Validação do Contrato / Schema principal
      expect(body).to.have.property('responseCode', 200);
      expect(body).to.have.property('products').that.is.an('array');

      expect(body.products).to.have.length.greaterThan(0);

      // Validando a estrutura e os tipos de dados do primeiro produto do array
      const product = body.products[0];
      expect(product.id).to.be.a('number');
      expect(product.name).to.be.a('string');
      expect(product.price).to.be.a('string');
      expect(product.brand).to.be.a('string');
      expect(product.category).to.be.an('object');
      expect(product.category).to.have.property('category').that.is.a('string');
      expect(product.category).to.have.property('usertype').that.is.an('object');
    });
  });

  it('Deve criar um usuário dinâmico via POST e limpar o ambiente ao final', () => {
    // Extrai email e password em variáveis para reuso na limpeza pós-teste
    const email = faker.internet.email();
    const password = faker.internet.password();

    cy.request({
      method: 'POST',
      url: `${baseUrl}/createAccount`,
      form: true, 
      body: {
        name: faker.person.fullName(),
        email,
        password,
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
        mobile_number: faker.string.numeric(11) 
      }
    }).then((response) => {
      expect(response.status).to.eq(200);

      const body = JSON.parse(response.body);
      expect(body.responseCode).to.eq(201); 
      expect(body.message).to.eq('User created!');
    });

    // Limpeza pós-teste: remove o usuário criado para não poluir o ambiente
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/deleteAccount`,
      form: true,
      body: { email, password }
    }).then((response) => {
      const body = JSON.parse(response.body);
      expect(body.responseCode).to.eq(200);
    });
  });

  it('Deve retornar erro ao tentar criar usuário com e-mail já cadastrado', () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    const payload = {
      name: faker.person.fullName(),
      email,
      password,
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
      mobile_number: faker.string.numeric(11)
    };

    // Primeiro POST — cria o usuário com sucesso
    cy.request({
      method: 'POST',
      url: `${baseUrl}/createAccount`,
      form: true,
      body: payload
    }).then((response) => {
      const body = JSON.parse(response.body);
      expect(body.responseCode).to.eq(201);
    });

    // Segundo POST — mesmo e-mail, deve retornar erro de duplicidade
    cy.request({
      method: 'POST',
      url: `${baseUrl}/createAccount`,
      form: true,
      body: payload,
      failOnStatusCode: false // Correção: Impede que o Cypress falhe automaticamente
    }).then((response) => {
      const body = JSON.parse(response.body);
      expect(body.responseCode).to.eq(400);
      expect(body.message).to.eq('Email already exists!');
    });

    // Limpeza pós-teste: remove o usuário criado no primeiro POST
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/deleteAccount`,
      form: true,
      body: { email, password }
    }).then((response) => {
      const body = JSON.parse(response.body);
      expect(body.responseCode).to.eq(200);
    });
  });
});
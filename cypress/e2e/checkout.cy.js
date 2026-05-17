import { faker } from '@faker-js/faker';

describe('Fluxo de Compra E2E - Automation Exercise', () => {
  it('Deve finalizar uma compra com registro de novo usuário no checkout', () => {
    // Gerando massa de dados dinâmica
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address: faker.location.streetAddress(),
      state: faker.location.state(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      mobile: faker.phone.number()
    };

    // 1. Acessar o site e adicionar 2 produtos diferentes no carrinho
    cy.visit('https://automationexercise.com/');
    
    // Adicionando o primeiro produto
    cy.get('.features_items .col-sm-4').eq(0).within(() => {
      // Usando force:true para o Bug dos Ads
      cy.contains('Add to cart').click({ force: true }); 
    });
    cy.contains('Continue Shopping').should('be.visible').click();

    // Adicionando o segundo produto
    cy.get('.features_items .col-sm-4').eq(1).within(() => {
      cy.contains('Add to cart').click({ force: true });
    });
    cy.contains('Continue Shopping').should('be.visible').click();

    // 2. Prosseguir para o checkout e realizar o registro dinâmico do usuário
    cy.get('.shop-menu').contains('Cart').click();
    cy.contains('Proceed To Checkout').click();
    
    // Modal está visível
    cy.get('#checkoutModal').should('be.visible');
    
    // Correção: Busca a tag "a" (link) que tenha o destino exato "/login" dentro do modal
    cy.get('#checkoutModal a[href="/login"]').click({ force: true });

    // Aguarda a mudança de página
    cy.url({ timeout: 10000 }).should('include', '/login');

    // Formulário inicial de Signup
    // Mudança 3: Esticamos o tempo limite para 10 segundos apenas neste elemento para compensar o carregamento dos ads
    cy.get('.signup-form', { timeout: 10000 }).should('be.visible').within(() => {
      cy.get('input[name="name"]').type(userData.name);
      cy.get('input[name="email"]').type(userData.email);
      cy.get('button[type="submit"]').click();
    });

    // Formulário completo de detalhes da conta
    cy.get('#id_gender1').check();
    cy.get('[data-qa="password"]').type(userData.password);
    cy.get('[data-qa="days"]').select('15');
    cy.get('[data-qa="months"]').select('May');
    cy.get('[data-qa="years"]').select('1990');

    cy.get('[data-qa="first_name"]').type(userData.firstName);
    cy.get('[data-qa="last_name"]').type(userData.lastName);
    cy.get('[data-qa="address"]').type(userData.address);
    cy.get('[data-qa="country"]').select('United States');
    cy.get('[data-qa="state"]').type(userData.state);
    cy.get('[data-qa="city"]').type(userData.city);
    cy.get('[data-qa="zipcode"]').type(userData.zipcode);
    cy.get('[data-qa="mobile_number"]').type(userData.mobile);
    cy.get('[data-qa="create-account"]').click();

    // Valida criação e prossegue
    cy.get('[data-qa="account-created"]').should('be.visible');
    cy.get('[data-qa="continue-button"]').click();

    // 3. Validar se os produtos corretos estão na tela de revisão do carrinho
    cy.get('.shop-menu').contains('Cart').click();
    cy.contains('Proceed To Checkout').click();
    
    cy.get('#cart_info').should('contain', 'Blue Top');
    cy.get('#cart_info').should('contain', 'Men Tshirt');

    // Inserir comentário e confirmar pedido
    cy.get('textarea[name="message"]').type('Por favor, entregar em horário comercial.');
    cy.contains('Place Order').click();

    // 4. Preencher os dados de pagamento e validar a mensagem de sucesso
    cy.get('[data-qa="name-on-card"]').type(userData.name);
    cy.get('[data-qa="card-number"]').type(faker.finance.creditCardNumber('####-####-####-####'));
    // Usando um CVC estático simples pois a API aceita qualquer coisa (referencia ao Bug 4 que achei)
    cy.get('[data-qa="cvc"]').type('123'); 
    cy.get('[data-qa="expiry-month"]').type('12');
    cy.get('[data-qa="expiry-year"]').type('2030');
    cy.get('[data-qa="pay-button"]').click();

    // Validação final de sucesso 
    cy.get('[data-qa="order-placed"]').should('be.visible');
    cy.contains('Congratulations! Your order has been confirmed!').should('be.visible');
  });
});
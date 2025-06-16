describe('SignUp Page', () => {
  beforeEach(() => {
    // Visit the signup page before each test
    cy.visit('http://localhost:5173/SignUp')
    // Wait for any initial auth checks to complete
    cy.wait(1000)
  })

  it('displays the signup form', () => {
    cy.get('[data-testid="signup-form"]').should('be.visible')
    cy.get('[data-testid="username-input"]').should('be.visible')
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
    cy.get('[data-testid="confirm-password-input"]').should('be.visible')
    cy.get('[data-testid="signup-button"]').should('be.visible')
  })

  it('validates required fields', () => {
    // Try to submit empty form
    cy.get('[data-testid="signup-button"]').click()
    
    // Check for error messages
    cy.get('[data-testid="username-error"]').should('contain', 'Username is required')
    cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
    cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    cy.get('[data-testid="confirm-password-error"]').should('contain', 'Please confirm your password')
  })

  it('validates minimum username length', () => {
    cy.get('[data-testid="username-input"]').type('ab')
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('123456')
    cy.get('[data-testid="confirm-password-input"]').type('123456')
    cy.get('[data-testid="signup-button"]').click()
    
    // Check for error message
    cy.get('[data-testid="username-error"]').should('contain', 'Username must be at least 3 characters long')
  })

  it('validates minimum password length', () => {
    cy.get('[data-testid="username-input"]').type('testuser')
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('12345')
    cy.get('[data-testid="confirm-password-input"]').type('12345')
    cy.get('[data-testid="signup-button"]').click()
    
    // Check for error message
    cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 6 characters long')
  })

  it('validates password match', () => {
    cy.get('[data-testid="username-input"]').type('testuser')
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('123456')
    cy.get('[data-testid="confirm-password-input"]').type('1234567')
    cy.get('[data-testid="signup-button"]').click()
    
    // Check for error message
    cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match')
  })

  it('validates email format', () => {
    cy.get('[data-testid="username-input"]').type('testuser')
    cy.get('[data-testid="email-input"]').type('invalid-email')
    cy.get('[data-testid="password-input"]').type('123456')
    cy.get('[data-testid="confirm-password-input"]').type('123456')
    cy.get('[data-testid="signup-button"]').click()
    
    // Check for error message
    cy.get('[data-testid="email-error"]').should('contain', 'Please enter a valid email address')
  })

  it('handles successful signup', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: '123456'
    }

    // Intercept both the signup and login requests
    cy.intercept('POST', '**/users/simple', {
      statusCode: 200,
      body: { 
        message: 'User created successfully',
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
      },
      headers: {
        'Set-Cookie': 'token=fake-access-token; HttpOnly; Secure; SameSite=Strict, refreshToken=fake-refresh-token; HttpOnly; Secure; SameSite=Strict'
      }
    }).as('signupRequest')

    // Intercept the login request that follows signup
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        message: 'Login successful',
        user: {
          id: 1,
          username: testUser.username,
          email: testUser.email
        }
      },
      headers: {
        'Set-Cookie': 'token=fake-access-token; HttpOnly; Secure; SameSite=Strict, refreshToken=fake-refresh-token; HttpOnly; Secure; SameSite=Strict'
      }
    }).as('loginRequest')

    // Also intercept the subsequent auth/me call
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: testUser.username,
        email: testUser.email
      }
    }).as('meRequest')

    // Fill out the form
    cy.get('[data-testid="username-input"]').type(testUser.username)
    cy.get('[data-testid="email-input"]').type(testUser.email)
    cy.get('[data-testid="password-input"]').type(testUser.password)
    cy.get('[data-testid="confirm-password-input"]').type(testUser.password)
    
    // Submit the form
    cy.get('[data-testid="signup-button"]').click()

    // Wait for all API calls
    cy.wait(['@signupRequest', '@loginRequest', '@meRequest'])

    // Check for success message
    cy.contains('Account successfully created! Welcome!').should('be.visible')
    
    // Should be redirected to account page
    cy.url().should('include', '/account')
  })

  it('handles server errors for existing username', () => {
    // Intercept the signup API call with an error
    cy.intercept('POST', '**/users/simple', {
      statusCode: 409,
      body: { message: 'This username is already in use.' }
    }).as('signupError')

    // Fill out the form
    cy.get('[data-testid="username-input"]').type('existinguser')
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('123456')
    cy.get('[data-testid="confirm-password-input"]').type('123456')
    
    // Submit the form
    cy.get('[data-testid="signup-button"]').click()

    // Wait for the API call
    cy.wait('@signupError')

    // Check for error message
    cy.contains('This username is already in use').should('be.visible')
  })

  it('handles server errors for existing email', () => {
    // Intercept the signup API call with an error
    cy.intercept('POST', '**/users/simple', {
      statusCode: 409,
      body: { message: 'This email address is already in use.' }
    }).as('signupError')

    // Fill out the form
    cy.get('[data-testid="username-input"]').type('newuser')
    cy.get('[data-testid="email-input"]').type('existing@example.com')
    cy.get('[data-testid="password-input"]').type('123456')
    cy.get('[data-testid="confirm-password-input"]').type('123456')
    
    // Submit the form
    cy.get('[data-testid="signup-button"]').click()

    // Wait for the API call
    cy.wait('@signupError')

    // Check for error message
    cy.contains('This email address is already in use').should('be.visible')
  })


  it('navigates to login page', () => {
    cy.get('[data-testid="login-link"]').click()
    cy.url().should('include', 'http://localhost:5173/Login')
  })
}) 
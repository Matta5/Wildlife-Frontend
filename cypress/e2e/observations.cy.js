describe('Observations Page', () => {
    beforeEach(() => {
        // Always mock as authenticated user
        cy.intercept('GET', '**/auth/me', {
            statusCode: 200,
            body: {
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            }
        }).as('authCheck')

        // Mock initial observations load
        cy.intercept('GET', '**/observations?limit=30', {
            statusCode: 200,
            body: []
        }).as('loadObservations')

        cy.intercept('GET', '**/observations/GetAllFromUser/1', {
            statusCode: 200,
            body: []
        }).as('userObservations')

        cy.visit('/observations')
        cy.wait(['@authCheck', '@loadObservations'])
    })

    it('displays the explore tab by default', () => {
        cy.get('button').contains('Explore Community').should('have.class', 'border-blue-500')
        cy.get('[data-testid="new-observation-button"]').should('contain', 'New Observation')
    })

    it('displays empty state when no observations exist', () => {
        cy.contains('No community observations yet').should('be.visible')
        cy.contains('Be the first to share a wildlife sighting!').should('be.visible')
    })

    it('displays observations in the grid', () => {
        const mockObservations = [
            {
                id: 1,
                speciesId: 1,
                userId: 1,
                species: {
                    id: 1,
                    commonName: 'Red Fox',
                    scientificName: 'Vulpes vulpes',
                    taxonomy: { family: 'Canidae' }
                },
                user: {
                    id: 1,
                    username: 'testuser'
                },
                dateObserved: '2024-03-20T10:00:00',
                datePosted: '2024-03-20T10:00:00',
                body: 'Test observation',
                latitude: 51.5074,
                longitude: -0.1278,
                imageUrl: null
            }
        ]

        // Update the observations endpoint with mock data
        cy.intercept('GET', '**/observations?limit=30', {
            statusCode: 200,
            body: mockObservations
        }).as('getObservations')

        // Reload page to get mock data
        cy.visit('/observations')
        cy.wait(['@authCheck', '@getObservations'])

        cy.contains('Red Fox').should('be.visible')
    })

    it('filters observations by search term', () => {
        const mockObservations = [
            {
                id: 1,
                speciesId: 1,
                userId: 1,
                species: {
                    id: 1,
                    commonName: 'Red Fox',
                    scientificName: 'Vulpes vulpes',
                    taxonomy: { family: 'Canidae' }
                },
                user: {
                    id: 1,
                    username: 'testuser'
                },
                dateObserved: '2024-03-20T10:00:00',
                datePosted: '2024-03-20T10:00:00',
                body: 'Test observation',
                latitude: 51.5074,
                longitude: -0.1278,
                imageUrl: null
            },
            {
                id: 2,
                speciesId: 2,
                userId: 1,
                species: {
                    id: 2,
                    commonName: 'Grey Wolf',
                    scientificName: 'Canis lupus',
                    taxonomy: { family: 'Canidae' }
                },
                user: {
                    id: 1,
                    username: 'testuser'
                },
                dateObserved: '2024-03-20T11:00:00',
                datePosted: '2024-03-20T11:00:00',
                body: 'Another test observation',
                latitude: 51.5074,
                longitude: -0.1278,
                imageUrl: null
            }
        ]

        // Update the observations endpoint with mock data
        cy.intercept('GET', '**/observations?limit=30', {
            statusCode: 200,
            body: mockObservations
        }).as('getObservations')

        // Reload page to get mock data
        cy.visit('/observations')
        cy.wait(['@authCheck', '@getObservations'])

        // Verify observations are displayed
        cy.contains('Red Fox').should('be.visible')
        cy.contains('Grey Wolf').should('be.visible')

        // Test search filtering
        cy.get('input[placeholder*="Search species"]').type('fox')
        cy.contains('Red Fox').should('be.visible')
        cy.contains('Grey Wolf').should('not.exist')
    })

    it('switches between explore and my observations tabs', () => {
        const mockUserObservations = [
            {
                id: 1,
                speciesId: 1,
                userId: 1,
                species: {
                    id: 1,
                    commonName: 'Red Fox',
                    scientificName: 'Vulpes vulpes'
                },
                dateObserved: '2024-03-20T10:00:00'
            }
        ];

        cy.intercept('GET', '**/observations/GetAllFromUser/1', {
            statusCode: 200,
            body: mockUserObservations
        }).as('userObservations')
        
        // Click My Observations tab first
        cy.get('button').contains('My Observations').click()
        cy.wait('@userObservations')
        cy.contains('Red Fox').should('be.visible')
        
        // Click Explore Community tab
        cy.get('button').contains('Explore Community').click()
    })

    it('creates new observation', () => {
        cy.intercept('GET', '**/api/species/search*', {
            statusCode: 200,
            body: [
              {
                id: 1,
                commonName: 'Red Fox',
                scientificName: 'Vulpes vulpes'
              }
            ]
        }).as('speciesSearch')
        
        cy.intercept('POST', '**/observations/simple', {
            statusCode: 200,
            body: { message: 'Observation created successfully' }
        }).as('createObservation')

        // Click the button after setting up intercepts
        cy.get('[data-testid="new-observation-button"]').click()
        
        // Fill the form
        cy.get('input[placeholder*="Search for a species"]').type('Red{enter}')
        cy.wait('@speciesSearch')
        cy.contains('Red Fox').click()
        
        // Fill required date field - use today's date
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        cy.get('[data-testid="observation-form-date"]').type(today)
        
        cy.get('textarea[name="body"]').type('Test observation')
        
        // Submit form and verify success flow
        cy.get('[data-testid="observation-form-submit"]').should('not.be.disabled').click()
        cy.wait('@createObservation')

        // Verify success toast appears
        cy.get('.Toastify__toast')
            .should('be.visible')
            .and('contain', 'Observation created successfully')
            .then(() => {
                // After toast appears, verify modal closes
                cy.get('[data-testid="observation-form-submit"]').should('not.exist')
            })
    })
})
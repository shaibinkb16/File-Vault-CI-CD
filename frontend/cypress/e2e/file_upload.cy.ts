describe('File Upload E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should upload a file successfully', () => {
    // Select a file
    cy.get('input[type="file"]').attachFile('test.txt');
    
    // Check if file is selected
    cy.contains('test.txt').should('be.visible');
    
    // Click upload button
    cy.contains('Upload File').click();
    
    // Check for success message
    cy.contains('Upload Complete!').should('be.visible');
  });

  it('should handle drag and drop', () => {
    // Create a test file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Trigger drag and drop
    cy.get('[data-testid="drop-zone"]')
      .trigger('dragenter')
      .trigger('dragover')
      .trigger('drop', {
        dataTransfer: {
          files: [file],
        },
      });
    
    // Check if file is selected
    cy.contains('test.txt').should('be.visible');
  });

  it('should show image preview', () => {
    // Select an image file
    cy.get('input[type="file"]').attachFile('test.jpg');
    
    // Check if preview is shown
    cy.get('img[alt="Preview"]').should('be.visible');
  });

  it('should handle duplicate files', () => {
    // Upload first file
    cy.get('input[type="file"]').attachFile('test.txt');
    cy.contains('Upload File').click();
    cy.contains('Upload Complete!').should('be.visible');
    
    // Try to upload same file again
    cy.get('input[type="file"]').attachFile('test.txt');
    cy.contains('Upload File').click();
    
    // Check for duplicate message
    cy.contains('File already exists').should('be.visible');
  });

  it('should handle file search', () => {
    // Upload a file
    cy.get('input[type="file"]').attachFile('test.txt');
    cy.contains('Upload File').click();
    
    // Search for the file
    cy.get('input[type="search"]').type('test');
    
    // Check if file appears in results
    cy.contains('test.txt').should('be.visible');
  });

  it('should handle file deletion', () => {
    // Upload a file
    cy.get('input[type="file"]').attachFile('test.txt');
    cy.contains('Upload File').click();
    
    // Find and click delete button
    cy.contains('test.txt')
      .parent()
      .find('button[aria-label="Delete"]')
      .click();
    
    // Confirm deletion
    cy.contains('Delete').click();
    
    // Check if file is removed
    cy.contains('test.txt').should('not.exist');
  });

  it('should handle batch upload', () => {
    // Select multiple files
    cy.get('input[type="file"]').attachFile(['test.txt', 'test.jpg']);
    
    // Check if both files are selected
    cy.contains('test.txt').should('be.visible');
    cy.contains('test.jpg').should('be.visible');
    
    // Upload files
    cy.contains('Upload File').click();
    
    // Check for success message
    cy.contains('Upload Complete!').should('be.visible');
  });
}); 
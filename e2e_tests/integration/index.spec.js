/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Cypress, cy, test, expect */

const Carousel = '[data-test-id="carousel"]'
const SubmitQueryButton = '[data-test-id="submitQuery"]'
const Editor = '.ReactCodeMirror textarea'

describe('Neo4j Browser', () => {
  it('loads', () => {
    cy
      .visit(Cypress.env('BROWSER_URL') || 'http://localhost:8080')
      .title()
      .should('include', 'Neo4j Browser')
  })
  it('sets new login credentials', () => {
    const newPassword = Cypress.env('BROWSER_NEW_PASSWORD') || 'newpassword'
    cy.setInitialPassword(newPassword)
    cy.disconnect()
  })
  it('show "no connection" error when not using web workers', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':config useCypherThread: false')
    cy.executeCommand('RETURN 1')
    cy
      .get('[data-test-id="frameContents"]', { timeout: 10000 })
      .first()
      .should('contain', 'No connection found, did you connect to Neo4j')
  })
  it('show "no connection" error when using web workers', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':config useCypherThread: true')
    cy.executeCommand('RETURN 1')
    cy
      .get('[data-test-id="frameContents"]', { timeout: 10000 })
      .first()
      .should('contain', 'No connection found, did you connect to Neo4j')
  })
  it('can login', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':server connect')
    const password = Cypress.env('BROWSER_NEW_PASSWORD') || 'newpassword'
    cy.connect(password)
  })
  it('can empty the db', () => {
    cy.executeCommand(':clear')
    const query = 'MATCH (n) DETACH DELETE n'
    cy.executeCommand(query)
    cy.waitForCommandResult()
    cy
      .get('[data-test-id="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', query)
    cy
      .get('[data-test-id="frameStatusbar"]', { timeout: 100000 })
      .first()
      .contains(/completed/i)
  })
  it('can run cypher statement', () => {
    cy.executeCommand(':clear')
    const query = 'return 1'
    cy.executeCommand(query)
    cy.waitForCommandResult()
    cy
      .get('[data-test-id="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', query)
    cy
      .get('[data-test-id="frameStatusbar"]', { timeout: 10000 })
      .first()
      .should('contain', 'Started streaming')
  })
  it('can exec cypher from `:play movies`', () => {
    cy.executeCommand(':clear')
    const query = ':play movies'
    cy.executeCommand(query)
    cy
      .get('[data-test-id="frameCommand"]')
      .first()
      .should('contain', query)
    cy
      .get(Carousel)
      .find('[data-test-id="nextSlide"]')
      .click()
    cy
      .get(Carousel)
      .find('[data-test-id="nextSlide"]')
      .click()
    cy
      .get(Carousel)
      .find('[data-test-id="previousSlide"]')
      .click()
    cy
      .get(Carousel)
      .find('.code')
      .click()
    cy.get(SubmitQueryButton).click()
    cy.waitForCommandResult()
    cy
      .get('[data-test-id="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', 'Emil Eifrem')
  })
  it('can display meta items from side drawer', () => {
    cy.executeCommand(':clear')
    cy.get('[data-test-id="drawerDB"]').click()
    cy
      .get('[data-test-id="sidebarMetaItem"]', { timeout: 30000 })
      .should('have.length', 18)
  })
  it('will clear local storage when clicking "Clear local data"', () => {
    const scriptName = 'foo'
    cy.get(Editor).type(`//${scriptName}`, { force: true })
    cy.get('[data-test-id="editorFavorite"]').click()

    cy.get('[data-test-id="drawerFavorites"]').click()
    cy
      .get('[data-test-id="sidebarFavoriteItem"]')
      .first()
      .should('be', scriptName)

    cy.get('[data-test-id="drawerSync"]').click()
    cy.get('[data-test-id="clearLocalData"]').click()
    cy.wait(500)

    // confirm clear
    cy.get('[data-test-id="clearLocalData"]').click()

    cy.get('[data-test-id="drawerFavorites"]').click()
    cy.get('[data-test-id="sidebarFavoriteItem"]').should('have.length', 0)

    // once data is cleared the user is logged out and the connect form is displayed
    cy.get('input[data-test-id="boltaddress"]')
  })
  it('will add parameter using `:param` command', () => {
    // add cypher evalutated param function
    const command = ':param foo => 1 + 1'
    cy.get(Editor).type(command, { force: true })
    cy.get(Editor).should('have.value', command)
    cy.get(SubmitQueryButton).click()
    cy
      .get('[data-test-id="frameCommand"]')
      .first()
      .should('contain', command)
    cy
      .get('[data-test-id="rawParamData"]')
      .first()
      .should('contain', 'foo')
    cy
      .get('[data-test-id="rawParamData"]')
      .first()
      .should('contain', 2)
  })
})

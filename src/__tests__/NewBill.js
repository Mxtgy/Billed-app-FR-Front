/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then a form should appear", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage})
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeTruthy()
    })
  })
  describe("When I add a file in the form", () => {
    test("Then if it's a good file", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = mockStore
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage})
      const fileNewBill = screen.getByTestId('file')
      const fakeFile = new File(['hello'], 'hello.png', { type: 'image/png' });
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileNewBill.addEventListener('change', handleChangeFile)
      userEvent.upload(fileNewBill, fakeFile)
      expect(handleChangeFile).toHaveBeenCalled()
    })
    test("Then if it's a wrong file", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = mockStore
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage})
      const fileNewBill = screen.getByTestId('file')
      const fakeFile = new File(['hello'], 'hello.html', { type: 'text/html' });
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const checkFile = jest.fn(newBill.checkFile)
      fileNewBill.addEventListener('change', handleChangeFile)
      expect(() => { checkFile(fakeFile) }).toThrow('Not the right file type')
    })
  })
})


describe("Given I am a user connected as Employee", () => {
  describe("When I post a Bill", () => {
    test("Then I can find the bill on the bills page", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = mockStore
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage})
      const fileNewBill = screen.getByTestId('file')
      const fakeFile = new File(['hello'], 'hello.png', { type: 'image/png' })
      const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile')
      fileNewBill.addEventListener('change', handleChangeFile)
      userEvent.upload(fileNewBill, fakeFile)
      expect(handleChangeFile).toHaveBeenCalled()

      await new Promise(process.nextTick)

      const fakeBill = {
        type: 'Transports',
        name: 'TEST POST OK',
        amount: '348',
        date:  '2022-11-08',
        vat: '70',
        pct: '20',
        commentary: 'TEST COMMENTARY',
        fileUrl: '/Applications/MAMP/htdocs/Projet 9 - Billed/bill-app/Billed-app-FR-Front/src/assets/images/facturefreemobile.jpg',
        fileName: 'TEST NAME',
        status: 'pending'
      }

      /*fireEvent.change(screen.getByTestId('expense-type'), { target: { value: fakeBill.type } })
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: fakeBill.name } })
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: fakeBill.date } })
      fireEvent.change(screen.getByTestId('amount'), { target: { value: fakeBill.amount } })
      fireEvent.change(screen.getByTestId('vat'), { target: { value: fakeBill.vat } })
      fireEvent.change(screen.getByTestId('pct'), { target: { value: fakeBill.pct } })
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: fakeBill.commentary } })*/

      screen.getByTestId('expense-type').value = fakeBill.type
      screen.getByTestId('expense-name').value = fakeBill.name
      screen.getByTestId('datepicker').value = fakeBill.date
      screen.getByTestId('amount').value = fakeBill.amount
      screen.getByTestId('vat').value = fakeBill.vat
      screen.getByTestId('pct').value = fakeBill.pct
      screen.getByTestId('commentary').value = fakeBill.commentary

      const formNewBill = screen.getByTestId('form-new-bill')

      const billtry = new Bills({ document, onNavigate, store, localStorage: window.localStorage})
      const getBills = jest.spyOn(billtry, 'getBills')
      

      const handleSubmit = jest.spyOn(newBill, 'handleSubmit')
      formNewBill.addEventListener("submit", handleSubmit)

      fireEvent.submit(formNewBill)

      expect(handleSubmit).toHaveBeenCalled()

      await new Promise(process.nextTick)
      const bills = await billtry.getBills()
      const message = screen.getByText('TEST POST OK')
      expect(message).toBeTruthy()

    })
  })
})
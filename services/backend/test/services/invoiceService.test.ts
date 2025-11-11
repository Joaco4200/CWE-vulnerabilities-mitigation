import jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import ejs from 'ejs';

import InvoiceService from '../../src/services/invoiceService';
import db from '../../src/db';
import { Invoice } from '../../src/types/invoice';
process.env.JWT_SECRET = 'test-secret';

import AuthService from '../../src/services/authService';


jest.mock('nodemailer');
jest.mock('../../src/db')
const mockedDb = db as jest.MockedFunction<typeof db>

test('Not Allowed Template Injection', async () =>{

  (db as unknown as jest.Mock).mockReturnValue({
    where: () => ({
      orWhere: () => ({
        first: async () => null,
        insert: async () => {}
      })
    })
  });

  const sendMail = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

  const userMalicioso = {
    username: 'joaco',
    password: 'joaco2019',
    email: 'joaco2019@example.com',
    first_name: '<%= 2 + 2 %>',
    last_name: 'xxx'
  };

  await AuthService.createUser(userMalicioso);

  const html = sendMail.mock.calls[0][0].html;
  expect(html).not.toContain('4');

});



describe('AuthService.generateJwt', () => {
  beforeEach (() => {
    jest.resetModules();
  });

  beforeAll(() => {
  });

  afterAll(() => {
  });

  it('listInvoices', async () => {
    const userId = 'user123';
    const state = 'paid';
    const operator = 'eq';
    const mockInvoices: Invoice[] = [
      { id: 'inv1', userId, amount: 100, dueDate: new Date(), status: 'paid' },
      { id: 'inv2', userId, amount: 200, dueDate: new Date(), status: 'paid' }
    ];
    // mock no user exists
    const selectChain = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockInvoices),
    };
    mockedDb.mockReturnValue(selectChain as any);

    const invoices = await InvoiceService.list(userId, state, operator);

    expect(mockedDb().where).toHaveBeenCalledWith({ userId });
    expect(mockedDb().andWhere).toHaveBeenCalledWith('state', operator, state);
    expect(mockedDb().select).toHaveBeenCalled();
    expect(invoices).toEqual(mockInvoices);
  });

  it('listInvoices no state', async () => {
    const userId = 'user123';
    const mockInvoices: Invoice[] = [
      { id: 'inv1', userId, amount: 100, dueDate: new Date(), status: 'paid' },
      { id: 'inv2', userId, amount: 200, dueDate: new Date(), status: 'unpaid' }
    ];
    // mock no user exists
    const selectChain = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockInvoices),
    };
    mockedDb.mockReturnValue(selectChain as any);
    const invoices = await InvoiceService.list(userId);

    expect(mockedDb().where).toHaveBeenCalledWith({ userId });
    expect(mockedDb().andWhere).not.toHaveBeenCalled();
    expect(mockedDb().select).toHaveBeenCalled();
    expect(invoices).toEqual(mockInvoices);
  });

});

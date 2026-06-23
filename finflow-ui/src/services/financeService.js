import api from './api';

// Fetches institutional liquidity pool numbers
export const getMyWallet = async () => {
    const response = await api.get('/wallets/my-wallet');
    return response.data;
};

// Fetches immutable double-entry ledger rows
export const getTransactionHistory = async () => {
    const response = await api.get('/transactions/history');
    return response.data;
};

// WIRE TRANSFER SERVICE
export const transferFunds = async (receiverEmail, amount, description) => {
    const response = await api.post('/wallets/transfer', {
        receiverEmail: receiverEmail,
        amount: amount,
        description: description
    });
    return response.data;
};

// STRIPE GATEWAY SERVICES 
export const createPaymentIntent = async (amount) => {
    const response = await api.post('/payments/create-intent', { amount });
    return response.data;
};

export const confirmDeposit = async (amount) => {
    const response = await api.post('/payments/confirm-deposit', { amount });
    return response.data;
};

// PDF STATEMENT GENERATOR 
export const downloadStatement = async () => {
    const response = await api.get('/wallets/statement', { responseType: 'blob' });
    return response.data;
};

// VIRTUAL CARD ISSUING SERVICES 
export const getMyVirtualCards = async () => {
    const response = await api.get('/cards/my-cards');
    return response.data;
};

export const issueVirtualCard = async (cardholderName, limit) => {
    const response = await api.post('/cards/issue', { cardholderName, limit });
    return response.data;
};

// B2B INVOICING SERVICES
export const createInvoice = async (targetEmail, amount, description) => {
    const response = await api.post('/invoices/create', { targetEmail, amount, description });
    return response.data;
};

export const payInvoice = async (id) => {
    const response = await api.post(`/invoices/${id}/pay`);
    return response.data;
};

export const cancelInvoice = async (id) => {
    const response = await api.post(`/invoices/${id}/cancel`);
    return response.data;
};

export const getInvoiceInbox = async () => {
    const response = await api.get('/invoices/inbox');
    return response.data;
};
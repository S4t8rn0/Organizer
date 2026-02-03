const API_URL = 'http://localhost:3001/api';

// Get token from localStorage
const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Generic fetch wrapper with auth
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

// Auth API
export const authApi = {
    register: (email: string, password: string, name: string) =>
        fetchApi<{ user: any; message: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),

    login: (email: string, password: string) =>
        fetchApi<{ user: any; token: string; refreshToken: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    logout: () => fetchApi('/auth/logout', { method: 'POST' }),

    getMe: () => fetchApi<{ id: string; email: string; name: string }>('/auth/me'),
};

// Tasks API
export const tasksApi = {
    getAll: () => fetchApi<any[]>('/tasks'),
    create: (data: any) => fetchApi<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggle: (id: string) => fetchApi<any>(`/tasks/${id}/toggle`, { method: 'PATCH' }),
    delete: (id: string) => fetchApi(`/tasks/${id}`, { method: 'DELETE' }),
};

// Notes API
export const notesApi = {
    getAll: () => fetchApi<any[]>('/notes'),
    create: (data: any) => fetchApi<any>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi<any>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/notes/${id}`, { method: 'DELETE' }),
};

// Events API
export const eventsApi = {
    getAll: () => fetchApi<any[]>('/events'),
    create: (data: any) => fetchApi<any>('/events', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi<any>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/events/${id}`, { method: 'DELETE' }),
};

// Kanban API
export const kanbanApi = {
    getAll: () => fetchApi<any[]>('/kanban'),
    create: (data: any) => fetchApi<any>('/kanban', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi<any>(`/kanban/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/kanban/${id}`, { method: 'DELETE' }),
};

// Finance API
export const financeApi = {
    // Transactions
    getTransactions: () => fetchApi<any[]>('/finance/transactions'),
    createTransaction: (data: any) => fetchApi<any>('/finance/transactions', { method: 'POST', body: JSON.stringify(data) }),
    deleteTransaction: (id: string) => fetchApi(`/finance/transactions/${id}`, { method: 'DELETE' }),

    // Bills
    getBills: () => fetchApi<any[]>('/finance/bills'),
    createBill: (data: any) => fetchApi<any>('/finance/bills', { method: 'POST', body: JSON.stringify(data) }),
    updateBill: (id: string, data: any) => fetchApi<any>(`/finance/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleBill: (id: string) => fetchApi<any>(`/finance/bills/${id}/toggle`, { method: 'PATCH' }),
    deleteBill: (id: string) => fetchApi(`/finance/bills/${id}`, { method: 'DELETE' }),

    // Investments
    getInvestments: () => fetchApi<any[]>('/finance/investments'),
    createInvestment: (data: any) => fetchApi<any>('/finance/investments', { method: 'POST', body: JSON.stringify(data) }),
    updateInvestment: (id: string, data: any) => fetchApi<any>(`/finance/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteInvestment: (id: string) => fetchApi(`/finance/investments/${id}`, { method: 'DELETE' }),
};

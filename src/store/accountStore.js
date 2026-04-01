import { create } from 'zustand';

export const useAccountStore = create((set, get) => ({
  accounts:            [],
  selectedAccountId:   null,
  transactions:        [],
  transactionsLoading: false,
  sortBy:              'date',
  sortOrder:           'desc',

  setAccounts: (accounts, rates = []) => {
    const toRsd = (acc) => {
      const bal = acc.available_balance ?? 0;
      if (!acc.currency || acc.currency === 'RSD') return bal;
      const rate = rates.find(r => r.currency === acc.currency);
      return rate ? bal * (rate.sell_rate ?? 1) : bal;
    };
    const sorted = [...accounts].sort((a, b) => toRsd(b) - toRsd(a));
    set({ accounts: sorted, selectedAccountId: sorted[0]?.account_number ?? null });
  },

  selectAccount: (accountId) => set({
    selectedAccountId: accountId,
    transactions:      [],
    transactionsLoading: true,
  }),

  setTransactions: (transactions) => set({ transactions, transactionsLoading: false }),

  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  getSortedTransactions: () => {
    const { transactions, sortBy, sortOrder } = get();
    return [...transactions].sort((a, b) => {
      if (sortBy === 'date') {
        const cmp = new Date(a.date) - new Date(b.date);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      const cmp = a.type.localeCompare(b.type);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  },

  reset: () => set({
    accounts: [], selectedAccountId: null, transactions: [],
    transactionsLoading: false, sortBy: 'date', sortOrder: 'desc',
  }),
}));

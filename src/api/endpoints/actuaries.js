import api from '../client';

export const actuariesApi = {
  getAll:         (params)        => api.get('/actuaries', { params }),
  changeLimit:    (id, newLimit)  => api.patch(`/actuaries/${id}/limit`, { limit: newLimit }),
  resetUsedLimit: (id)            => api.patch(`/actuaries/${id}/reset-used-limit`, {}),
};

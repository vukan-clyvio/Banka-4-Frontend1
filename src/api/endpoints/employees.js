import api from '../client';

export const employeesApi = {
  getAll:          (params)    => api.get('/employees', { params }),
  getById:         (id)        => api.get(`/employees/${id}`),
  update:          (id, data)  => api.put(`/employees/${id}`, data),
  remove:          (id)        => api.delete(`/employees/${id}`),
  changePassword:  (data)      => api.post('/employees/change-password', data),
};

import client from './client'


export const getAllUsers = () =>
  client.get('/admin/users')


export const activateUser = (id: number) =>
  client.patch(`/admin/users/${id}/activate`)


export const deactivateUser = (id: number) =>
  client.patch(`/admin/users/${id}/deactivate`)

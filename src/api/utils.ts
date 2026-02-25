import client from './client'


export const healthCheck = () =>
  client.get('/health')


export const debugInfo = () =>
  client.get('/debug')

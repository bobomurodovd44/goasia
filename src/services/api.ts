import feathersClient from './feathersClient';

export const ordersService = feathersClient.service('orders');
export const usersService = feathersClient.service('users');
export const driversService = feathersClient.service('drivers');
export const vehiclesService = feathersClient.service('vehicles');
export const companiesService = feathersClient.service('companies');
export const paymentsService = feathersClient.service('payments');
export const placesService = feathersClient.service('places');
export const regionsService = feathersClient.service('regions');
export const auctionCallsService = feathersClient.service('auction-calls');
export const basePricesService = feathersClient.service('base-prices');
export const vehicleTypesService = feathersClient.service('vehicle-types');

export default feathersClient;

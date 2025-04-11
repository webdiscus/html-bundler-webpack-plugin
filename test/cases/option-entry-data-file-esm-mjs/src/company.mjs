import address from './companyAddress.mjs';

const data = {
  name: 'Awesome Corp',
  address: `${address.street}, ${address.city}`,
  phone: '+1 234 567 890',
  email: 'info@awesomecorp.com',
};

export default data;

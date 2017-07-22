const get = require('lodash/get');
const rp = require('request-promise-native');

export default function findShelterHandler(request, response) {
  console.log('findShelterHandler');

  const postalCode = get(request, 'location.postalCode');

  const options = {
    json: true,
    qs: {
      count: '5',
      format: 'json',
      location: postalCode,
      offset: '0',
      output: 'full',
      key: process.env.API_KEY
    },
    uri: 'http://api.petfinder.com/shelter.find',
  };

  return rp(options)
      .then(mapShelterResponse)
      .then(function (shelters: Shelter[]) {
        if (!get(shelters, 'length')) throw new Error('No shelters found');

        let text = `<p>I found ${shelters.length} shelters near you</p>`;

        const spokenShelters = shelters.map(shelter => {
          let shelterText = shelter.name;

          shelterText += (shelter.address1 || shelter.address2) ? ` at <say-as interpret-as="address">${shelter.address1 || ''} ${shelter.address2 || ''}</say-as>` : '';
          shelterText += shelter.city ? ` in ${shelter.city || ''} ${shelter.state || ''}.` : '';
          shelterText += shelter.phone ? ` </p>Phone: <say-as interpret-as="telephone">${shelter.phone}</say-as><p>` : '';
          shelterText += shelter.email ? ` </p>Email: ${shelter.email}<p>` : '';

          return `<p>${shelterText}</p>`;
        });
        text += spokenShelters.join('');

        const cardShelters = shelters.map(shelter => {
          let lines = [shelter.name];

          lines = lines.concat(shelter.address1 || []);
          lines = lines.concat(shelter.address2 || []);
          lines = lines.concat(shelter.city ? `${shelter.city} ${shelter.state || ''}` : []);
          lines = lines.concat(shelter.phone || []);
          lines = lines.concat(shelter.email || []);

          return lines.join('\n');
        });
        const card = {
          type: 'Simple',
          title: `Local shelters near ${postalCode}`,
          content: cardShelters.join('\n---\n'),
        };
        text += `<p>I've sent this list to your Alexa app.</p>`;

        return response.card(card).say(text).send();
      })
      .catch(function (err) {
        console.log('Error in findShelter: ' + err);

        return response.say(`I wasn't able to find any shelters near you.`).send();
      });
}

function mapShelterResponse(response: any): Promise<Shelter[]> {
  const shelters = get(response, 'petfinder.shelters.shelter', []);

  return shelters.map(shelter => {
    Object.keys(shelter).forEach(key => {
      if (shelter[key] && shelter[key].$t) {
        shelter[key] = shelter[key].$t;
      } else {
        delete shelter[key];
      }
    });

    return shelter;
  });
}

export interface Shelter {
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  email?: string;
  fax?: string;
  id?: string;
  latitude?: string;
  longitude?: string;
  name?: string;
  phone?: string;
  state?: string;
  zip?: string;
}

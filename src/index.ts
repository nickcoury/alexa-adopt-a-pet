declare let exports: any;
import * as alexa from 'alexa-app';
import * as router from 'alexa-app-router';

import findPetHandler from './handlers/findPet';
import findShelterHandler from './handlers/findShelter';

import {Animals} from './types';

(function () {
  const app = new alexa.app('alexa-adopt-a-pet');

  const config = {
    defaultRoute: '/',
    pre: preHandler,
    launch: launchHandler
  };

  const intents = {
    FindPetIntent: {
      slots: {ANIMAL_TYPE: 'ANIMAL_TYPE'},
      utterances: [
        '{for an|for a|}{pet|pets}{| to adopt| to rescue}',
        '{for an|}{-|ANIMAL_TYPE}{| to adopt| to rescue}'
      ]
    },
    FindShelterIntent: {utterances: ['{for a |for an |}{pet|animal |}{shelter}{| near me| around me}']},
    MenuIntent: {utterances: ['{get |give |read |}{me |}{the |}{menu|options|help}']},
  };

  const routes = {
    '/': {
      'AMAZON.CancelIntent': exitHandler,
      'AMAZON.HelpIntent': menuHandler,
      'AMAZON.StartOverIntent': launchHandler,
      'AMAZON.StopIntent': exitHandler,
      FindPetIntent: findPetHandler,
      FindShelterIntent: findShelterHandler,
      MenuIntent: menuHandler,
    },
    'pets/{id}': {
      'AMAZON.CancelIntent': exitHandler,
      'AMAZON.HelpIntent': menuHandler,
      'AMAZON.StartOverIntent': launchHandler,
      FindPetIntent: findPetHandler,
      MenuIntent: menuHandler,
    },
    'shelters/{id}': {
      'AMAZON.CancelIntent': exitHandler,
      'AMAZON.HelpIntent': menuHandler,
      'AMAZON.StartOverIntent': launchHandler,
      FindShelterIntent: findShelterHandler,
      MenuIntent: menuHandler,
    }
  };

  router.addRouter(app, config, intents, routes);

  app.messages.NO_INTENT_FOUND = 'Sorry, I didn\'t understand that.';
  app.messages.NO_LAUNCH_FUNCTION = 'Please ask me to do something!';
  app.messages.INVALID_REQUEST_TYPE = 'Sorry, I didn\'t understand that';
  app.messages.GENERIC_ERROR = 'Sorry, something went wrong. Please try saying something else.';

  // Connect to lambda
  exports.handler = app.lambda();
  exports.alexa = app;

  // Validate request
  // If initialization fails and returns false, caller should return true
  // to avoid running async executions.
  function preHandler(request, response) {
    console.log('intent:' + request.data.request.intent);
    return true;
  }

  function launchHandler(request, response) {
    console.log('launchHandler');
    let text = '';

    text += `Welcome to the Adopt a Pet Alexa skill. Ask for a pet or a shelter. For types of pets you can adopt, say help.`;
    console.log(text);
    response
      .say(text)
      .route('/')
      .send();
  }

  function menuHandler(request, response) {
    const text = [
        'You can ask for:',
        'Pets',
        'Shelters',
        'or a type of pet to adopt including',
      ]
      .concat(Object.keys(Animals))
      .map(x => `<p>${x}</p>`)
      .join('');
    console.log(text);
    response
      .say(text)
      .route('/')
      .send();
  }

  function exitHandler(request, response) {
    console.log('exitHandler');
    const text = 'Thanks for adopting a little one!';
    response
      .say(text)
      .send();
  }
})();

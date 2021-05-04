require('dotenv').config();

const Alexa = require('ask-sdk-core');
// axios to get info from oi oitchau
const axios = require('axios')
// oi tchau service
const OiTchauService = require('./services/OiTchauService')
// credentials for oi tchau
const credentials = {
    email: process.env.EMAIL,
    password: process.env.PASSWORD
}
// The timezone offset
const timeZone = 3
// token to be used
var token = ''
// employee id
var employee_id = ''
// oi tchau service
const oiTchauService = new OiTchauService(credentials, timeZone);

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = "Olá! Deseja bater o ponto ou consultar histórico.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HistoricoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'Historico';
    },
    async handle(handlerInput) {
        console.log("Inicializando...")
        try {
          //Call the progressive response service
          await callDirectiveService(handlerInput, "Entendi! Consultando seu histórico...");
    
        } catch (err) {
          // if it failed we can continue, just the user will wait longer for first response
          console.log("error : " + err);
        }
        
        await oiTchauService.login()
        const lastRegisters = await oiTchauService.getLastRegisters()
        const speakOutput = lastRegisters.reduce((acc,prev, idx) => idx < lastRegisters.length-1 ? acc + prev + ". " : acc + prev, "") + ". Deseja mais alguma coisa?";
        console.log(lastRegisters)
        console.log(speakOutput)
        console.log("Finalizado inicialização");
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const BaterPontoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'bater_ponto';
    },
    async handle(handlerInput) {
        console.log("Inicializando...")
        try {
          //Call the progressive response service
          await callDirectiveService(handlerInput, "Entendi! Batendo seu ponto...");
    
        } catch (err) {
          // if it failed we can continue, just the user will wait longer for first response
          console.log("error : " + err);
        }
        
        await oiTchauService.login()
        const lastRegisters = await oiTchauService.createRegister()
        console.log("Finalizado inicialização");
        const speakOutput = lastRegisters.reduce((acc,prev, idx) => idx < lastRegisters.length-1 ? acc + prev + ". " : acc + prev, "");
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = "Beleza. Cheiro no bumbum!";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = "Tas falando grego é. Repete aí, por obséquio.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        const speakOutput = "Já vai tarde, r s";
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse(); // notice we send an empty response
    }
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const errorOutput = "Rapaz o négocio deu ruim. Tenta de novo aí";
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(errorOutput)
            .reprompt(errorOutput)
            .getResponse();
    }
};


const callDirectiveService = async (handlerInput, text) => {
  // Call Alexa Directive Service.
  const requestEnvelope = handlerInput.requestEnvelope;
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

  const requestId = requestEnvelope.request.requestId;
  const endpoint = requestEnvelope.context.System.apiEndpoint;
  const token = requestEnvelope.context.System.apiAccessToken;

  // build the progressive response directive
  const directive = {
    header: {
      requestId,
    },
    directive: {
      type: "VoicePlayer.Speak",
      speech: text
    },
  };
  // send directive
  return directiveServiceClient.enqueue(directive, endpoint, token);
}




/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HistoricoIntentHandler,
        BaterPontoIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();

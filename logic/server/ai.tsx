/*import firebaseApp from "./firebase_config";
import { getVertexAI, getGenerativeModel, GenerativeModel, FunctionDeclaration, FunctionDeclarationSchemaType } from "firebase/vertexai-preview";

const AI_ENABLED = false

async function makeApiRequest(currencyFrom: string, currencyTo: string) {
    // This hypothetical API returns a JSON such as:
    // {"base":"USD","rates":{"SEK": 10.99}}
    return {
      base: currencyFrom,
      rates: { [currencyTo]: 10.99 },
    };
  }

  // Function declaration, to pass to the model.
const getExchangeRateFunctionDeclaration: FunctionDeclaration = {
    name: "getExchangeRate",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      description: "Get the exchange rate for currencies between countries",
      properties: {
        currencyFrom: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "The currency to convert from.",
        },
        currencyTo: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "The currency to convert to.",
        },
      },
      required: ["currencyTo", "currencyFrom"],
    },
  };
  
  // Executable function code. Put it in a map keyed by the function name
  // so that you can call it once you get the name string from the model.
  const functions = {
    getExchangeRate: ({ currencyFrom, currencyTo }: {currencyFrom: string, currencyTo: string}) => {
      return makeApiRequest(currencyFrom, currencyTo)
    }
};

if (AI_ENABLED) {
    // Initialize the Vertex AI service
    const vertexAI = getVertexAI(firebaseApp, {location: "europe-west8"});
  
    const model = getGenerativeModel(vertexAI, {
      model: "gemini-1.0-pro",
      // Specify the function declaration.
      tools: [{functionDeclarations: [getExchangeRateFunctionDeclaration]}],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
}

const askForSong = async (generativeModel: GenerativeModel) => {
    const chat = generativeModel.startChat();
    const prompt = "How much is 50 US dollars worth in Swedish krona?";

    // Send the message to the model.
    const result = await chat.sendMessage(prompt);

    // For simplicity, this uses the first function call found.
    const functionCalls = result.response.functionCalls();
    if (functionCalls === undefined) {
        return null;
    }
    const call = functionCalls[0];

    if (call) {
        // Call the executable function named in the function call
        // with the arguments specified in the function call and
        // let it call the hypothetical API.
        const apiResponse = await functions[call.name](call.args);

        // Send the API response back to the model so it can generate
        // a text response that can be displayed to the user.
        const result = await chat.sendMessage([{functionResponse: {
            name: 'getExchangeRate',
            response: apiResponse
        }}]);

        // Log the text response.
        console.log(result.response.text());
    }
}*/
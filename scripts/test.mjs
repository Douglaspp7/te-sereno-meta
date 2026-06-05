process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const url = "https://api.openai.com/v1/images/generations";
fetch(url).catch(e => console.error(e.cause));

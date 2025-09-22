const API_URL = 'http://127.0.0.1:8000';  // Or use 'localhost' if needed

// Your question to send to the API
const question = 'What is the content of the edital?';

fetch(API_URL, {
  method: 'POST',  // FastAPI expects a POST request
  headers: {
    'Content-Type': 'application/json',  // We're sending JSON data
  },
  body: JSON.stringify({ question: question }),  // Convert the request body to JSON
})
  .then((response) => {
    if (response.ok) {
      return response.json();  // Parse the JSON response
    }
    throw new Error('Failed to connect');
  })
  .then((data) => {
    console.log('Answer from API:', data.answer);
    console.log('Edital Name:', data.edital_name);
  })
  .catch((error) => {
    console.error('Error fetching the API:', error);
  });

const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: 4,
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
];

morgan.token('req-data', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    } else {
        return null;
    }
});

app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-data')); // Must be used after the json parser for easy access to request data
app.use(express.static('dist'));

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `);
});

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
    const id = +request.params.id;
    const person = persons.find((person) => person.id === id);
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = +request.params.id;
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
});

const generateId = () => Math.floor(1000 * Math.random());

app.post('/api/persons', (request, response) => {
    const body = request.body;
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing',
        });
    }
    if (persons.find(({ name }) => name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique',
        });
    }
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    };
    persons = persons.concat(person);
    response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

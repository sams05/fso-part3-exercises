require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const Person = require('./models/person');

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

app.get('/info', (request, response, next) => {
    Person.find({})
        .then((persons) => {
            response.send(`
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}</p>
            `);
        })
        .catch((error) => next(error));
});

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then((persons) => {
            response.json(persons);
        })
        .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    Person.findById(id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id)
        .then(() => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing',
        });
    }
    /* 
    if (persons.find(({ name }) => name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique',
        });
    }
    */

    const person = new Person({
        name: body.name,
        number: body.number,
    });
    person
        .save()
        .then(({ name, number }) => {
            console.log(`added ${name} number ${number} to phonebook`);
            response.json(person);
        })
        .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    const body = request.body;
    const person = {
        name: body.name,
        number: body.number,
    };
    Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
        .then((person) => {
            response.json(person);
        })
        .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }

    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

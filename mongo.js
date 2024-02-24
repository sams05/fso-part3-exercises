const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Please provide a password');
    process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://exercise-fullstack:${password}@cluster0.mmipfmi.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);

mongoose
    .connect(url)
    .then(() => console.log('Connected to database'))
    .catch((error) => console.log(error.message));

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);
/*
let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-445323523',
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43234345',
    },
    {
        id: 4,
        name: 'Mary Poppendieck',
        number: '39-236423122',
    },
];

persons.forEach(person => {
    const personDoc = new Person(person);
    personDoc.save().catch(error => console.error('fail to save', person));
});
*/
if (process.argv.length === 3) {
    Person.find({}).then((people) => {
        console.log('phonebook:');
        people.forEach(({ name, number }) => console.log(name, number));
        mongoose.connection.close();
    });
}

if (process.argv.length > 3) {
    const name = process.argv[3];
    const number = process.argv[4];
    const newPerson = new Person({
        name,
        number,
    });
    newPerson.save().then(({name, number}) => {
        console.log(`added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    });
}

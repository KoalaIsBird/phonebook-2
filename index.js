require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const { default: mongoose } = require('mongoose')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

// connect to mongo
mongoose.connect(process.env.MONGODB_URI)

// middleware
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
morgan.token('data', request => {
    return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

// get notes
app.get('/api/persons', (request, response) => {
    Person.find({}, { __v: 0 }).then(persons => {
        response.json(persons)
    })
})

// get info about notes
app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(
            `<p>Phonebook has info for ${persons.length} people <br>${Date()}</p>`
        )
    })
})

// get a person
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.send(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// delete person
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => response.status(204).end())
        .catch(error => next(error))
})

// add person
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'name or number is missing' })
    }

    Person.find({ name: body.name }).then(personsWithSameName => {
        if (personsWithSameName.length !== 0) {
            return response
                .status(400)
                .json({ error: 'name is already in the phonebook' })
        }

        const person = new Person({
            name: body.name,
            number: body.number
        })

        person
            .save()
            .then(savedPerson => {
                response.json(savedPerson)
            })
            .catch(error => next(error))
    })
})

// change person
app.put('/api/persons/:id', (request, response, next) => {
    const person = {
        name: request.body.name,
        number: request.body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {
        new: true,
        runValidators: true
    })
        .then(updatedPerson => {
            if (updatedPerson) {
                response.send(updatedPerson)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// more middleware
const unknownRoute = (request, response) => {
    response.status(404).send({ error: 'unknown url' })
}
app.use(unknownRoute)

const handleError = (error, request, response, next) => {
    console.log(error)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'badly formatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}
app.use(handleError)

// make app listen to port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('Server runs on port', PORT)
})

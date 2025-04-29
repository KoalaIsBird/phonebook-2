import axios from 'axios'
const url = 'http://localhost:3001/api/persons'


const getAll = () => {
    return axios.get(url)
}


const addPerson = (person) => {
    return axios.post(url, person)
}

const deletePerson = (person) => {
    return axios.delete(`${url}/${person._id}`)
}

const changePerson = (person, newPerson) => { 
    return axios.put(`${url}/${person._id}`, newPerson)
}


export default { getAll, addPerson, deletePerson, changePerson }


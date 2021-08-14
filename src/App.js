import React, { useState, useEffect } from 'react';
import phonebookService from './httpServices';

const App = () => {

  useEffect(() => {
    phonebookService.getAll().then((persons) => setPersons(persons));
  }, [])

  const [ persons, setPersons ] = useState([]);
  const [ newName, setNewName ] = useState('');
  const [ newNumber, setNewNumber ] = useState('');
  const [ filter, setFilter ] = useState('');
  const [ error, setError ] = useState({show: false, message: ''});
  
  const addPerson = (e) => {
    e.preventDefault();
    const personList = [...persons];
    const person = personList.find((person) => person.name === newName);
    setError({show: false, message: ''});
    if(person) {
      const confirmUpdate = window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)
      if (confirmUpdate) {
        updatePerson(person, personList);
      }
      return;
    }
    phonebookService.create({name: newName, number: newNumber})
    .then((person) => {
      console.log('Resp', person)
      setPersons(personList.concat(person))
    })
    .catch((error) => {
      setError({show: true, message: error.response.data.error});
    });
  }

  const updatePerson = (person, personList) => {
    phonebookService.update({...person, number: newNumber})
    .then((respPerson) => {
      personList = personList.map(ogperson => {
        if (ogperson._id === person._id) {
          ogperson = {...ogperson, number: newNumber};
        }
        return ogperson;
      });

      setPersons(personList);
    })
  }

  const deletePerson = (person) => {
    const deleteConfirm = window.confirm(`Delete ${person._id}`);

    if (deleteConfirm) {
      phonebookService.deleteEntry(person._id)
      .then((status) => {
        if (status === 204) {
          filterDeleted(person._id);
        }
      })
      .catch((error) => {
        console.log(error.response.data.error);
      })
    }
  }

  const filterDeleted = (id) => {
    const personList = persons.filter((person) => person._id !== id);
    setPersons([...personList]);
    personsToShow = [...personList];
  }
  
  let personsToShow = filter ? persons.filter((person) => person.name.toLowerCase().includes(filter.toLowerCase())) : persons;
  
  const propsForPersonForm = {
    addPerson,
    newName,
    newNumber,
    setNewName,
    setNewNumber
  }
  return (
    <div>
      <div hidden={!error.show}>Error: {error.message}</div>
      <h2>Phonebook</h2>
      <Filter filter = {filter} setFilter = {setFilter} />
      <h2>add a new</h2>
      <PersonForm props = {propsForPersonForm} />
      <h2>Numbers</h2>
      <Persons personsToShow = {personsToShow} deletePerson = {deletePerson} />
    </div>
  )
}

const Filter = ({filter, setFilter}) => {
   return (
    <div>
      filter shown with <input value = {filter} onChange = {(e) => setFilter(e.target.value)}  />
    </div>
   )
}

const PersonForm = ({props}) => {
  return (
    <div>
      <form onSubmit={props.addPerson}>
        <div>
          name: <input value = {props.newName}  onChange = {(e) => props.setNewName(e.target.value)} />
        </div>
        <div>
          number: <input type='number' value = {props.newNumber}  onChange = {(e) => props.setNewNumber(e.target.value)} />
        </div>
        <div>
          <button type='submit'>Add</button>
        </div>
      </form>
    </div>
  )
}

const Persons = ({personsToShow, deletePerson}) => {
  console.log(personsToShow);
  return (
    <div>
    {personsToShow.map((person) => (
      <div key = {person._id}>
        <p >{person.name} {person.number}</p>
        <button onClick = {() => {deletePerson(person)}}>Delete</button>
      </div>
    ))}
  </div>
  )
}

export default App;
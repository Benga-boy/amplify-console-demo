import { API, Storage } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { listNotes } from './graphql/queries'
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations'
import { useEffect, useState } from 'react'

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([])
  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState('')


  useEffect(() => {
    fetchNotes()
  }, [])

  // ! Fetch the list of notes from the API
  const fetchNotes = async () => {
    const apiData = await API.graphql({ query: listNotes })
    const notesFromApi =  apiData.data.listNotes.items
    await Promise.all(notesFromApi.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image)
        note.image = image
      }
      return note
    }))
    setNotes(apiData.data.listNotes.items)
  }


  // ! Function to add a new note
  const createNote = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.description) setError('Please add a note below')
    await API.graphql({ query: createNoteMutation, variables: { input: formData } })
    if (formData.image) {
      const image = await Storage.get(formData.image)
      formData.image = image
    }
    setNotes([...notes, formData])
    setFormData(initialFormState)
    setError('')
  }

  // ! Function to delete a note
  const deleteNoteFunc = async (id) => {
    const filteredNotesArray = notes.filter(note => note.id !== id)
    setNotes(filteredNotesArray)
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } } })
  }

  // ! Form input change handler
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ! File upload change handler
  const handleUpload = async e => {
    if (!e.target.files[0]) setError('Please upload an image')
    const file = e.target.files[0]
    setFormData({ ...formData, image: file.name })
    await Storage.put(file.name, file)
    fetchNotes()
  }

  console.log(notes)


  return (
    <div>
      <h1>Helloooo Baby! Notes App</h1>
      {error && error}
      <form onSubmit={createNote}>
        <input onChange={handleChange} name='name' type='text' placeholder='Add your name' value={formData.name} />
        <input onChange={handleChange} name='description' type='text' placeholder='Add your description' value={formData.description} />
        <input type='file' onChange={handleUpload} />
        <button>Create Note</button>
      </form>
      <div className="main">
        {
          notes.length !== 0 && notes.map(note => (
            <div key={note.id}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNoteFunc(note.id)}>Delete note</button>
              {
                note.image && <img key={note.id} src={note.image} width='400' height='380' />
              }
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  )
}

export default withAuthenticator(App) 

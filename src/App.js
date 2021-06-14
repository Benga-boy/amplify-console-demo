import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'

function App() {
  return (
    <div>
      <h1>Helloooo Baby!</h1>
      <AmplifySignOut />
    </div>
  )
}

export default withAuthenticator(App) 

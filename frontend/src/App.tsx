import { Router, Route } from 'wouter'
import { HomePage } from '@/pages/HomePage'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <Router>
      <Route path="/" component={HomePage} />
      <Route path="/home" component={HomePage} />
      <Toaster />
    </Router>
  )
}

export default App
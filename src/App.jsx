import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlogs, setNewBlogs] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [messageVisible, setMessageVisible] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    blogService
    .getAll()
    .then(initialBlogs =>
      setBlogs( initialBlogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = async (event) => {
    event.preventDefault();

    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newUrl,
    };

    try {
      const returnedBlog = await blogService.create(blogObject);
      setBlogs(blogs.concat(returnedBlog));
      setNewTitle('');
      setNewAuthor('');
      setNewUrl('');
      setSuccessMessage(`"${returnedBlog.title}" added successfully`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
    } catch (error) {
      console.error('Error creating blog:', error);
      setErrorMessage('Failed to add blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault()
    
    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      ) 

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setSuccessMessage(`Welcome ${user.name}`);
      setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage('Wrong credentials')
        setTimeout(() => {
          setErrorMessage(null)
        }, 2000)
      } else {
        console.error(`'Login error:', error`)
      setErrorMessage('Login failed. Please try again later.')
      }
    }
  }


  const handleLogout = async (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogappUser')
    window.location.reload()
  }

  const LoginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
          <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
          <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>      
  )

  const BlogForm = () => (
    <form onSubmit={addBlog}>
      <div>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
        />
      </div>
      <div>
        <input
          type="text"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          placeholder="Author"
        />
      </div>
      <div>
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL"
        />
      </div>
      <button type="submit">Save</button>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </form>
  );

  return (
    <div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}
      </div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}
      </div>}
      {!user && <h1>Login</h1>}

     {!user && LoginForm()}
      {
        user && <div>
          <h2>Blogs</h2>
        {BlogForm()}
        {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
        )}
        </div>
       }

    </div>
  )
}

export default App
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

  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newUrl
    }

    blogService
    .create(blogObject)
    .then(returnedBlog => {
      setBlogs(blogs.concat(returnedBlog))
      setNewBlogs('')
    })
  }

  const handleBlogChange = (event) => {
    setNewBlogs(event.target.value)
  }

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
      setMessageVisible(true);
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessageVisible(false);
    }, 3000);
  
    return () => {
      // Clear the timeout if the component unmounts or if the message is hidden before the timeout
      clearTimeout(timer);
    };
  }, [messageVisible]);

  const handleLogout = async (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogappUser')
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
      <input
        value={newBlogs}
        onChange={handleBlogChange}
      />
      <button type="submit">save</button>
      <button onClick={handleLogout}>logout</button>
    </form> 
  )

  return (
    <div>
      {!user && <h1>Login</h1>}

     {!user && LoginForm()}
      {
        user && <div>
          <h2>Blogs</h2>
          {messageVisible && <h3>{user.name} logged in</h3>}
        {BlogForm()}
        {blogs.map(blog =>
        <Blog blog={blog} />
        )}
        </div>
       }

    </div>
  )
}

export default App
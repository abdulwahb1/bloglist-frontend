const Blog = ({ blog }) => (
  <div>
    {blog.title} {blog.author} <a href="#" onClick={(e) => e.preventDefault()}>{blog.url}</a>
  </div>  
)

export default Blog
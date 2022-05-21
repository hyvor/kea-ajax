# KEA-AJAX

Kea-ajax is a simplified version of [kea-loaders](https://github.com/keajs/kea-loaders) plugin.

## Installation

```bash
npm install kea-ajax
```

```ts
import { ajax } from 'kea-ajax';

const blogLogic = kea([
    actions({ 
        setBlog: (blog) => ({blog})
    }),
    ajax(({actions}) => ({
        load: async () => {
            const blog = await axois.get(`/blog`);
            actions.setBlog(blog)
        }
    })),
    reducers({
        blog: [
            null as null | Blog,
            {
                setBlog: (_, {blog}) => blog
            }
        ]
    })
])
```

Unlike the kea-loaders plugin, kea-ajax plugin **does not automatically** update reducers for you. You have to manually call actions inside the callback (`actions.setBlog(blog)` above). This is allows more clear code where you can see what's happening by reading the code. It also encourages calling multiple actions within the callback.

Each property of the `ajax` definitions adds the following actions and reducers to the logic.

```ts
// actions
load
loadStart
loadSuccess
loadError

// reducers
loadAjax
```

## Using with React

Let's first write a little advanced logic. The following `postsLogic` fetches blog posts from an API. There are two reducers (states): `posts` saves the posts list. `hasMore` saves whether there are more posts to load.

```ts
const postsLogic = kea([
    actions({ 
        setPosts: (post: Post) => ({post}),
        setHasMore: (hasMore: hasMore) => ({hasMore})
    }),
    ajax(({actions}) => ({
        load: async () => {
            /**
             * API Response
             * data = {
             *     posts: Post[],
             *     hasMore: boolean
             * }
             */
            const data = await axois.get(`/posts`);
            
            actions.setPosts(data.posts)
            actions.setHasMore(data.hasMore)
        }
    })),
    reducers({
        posts: [
            [] as Post[],
            {
                setPosts: (_, {blog}) => blog
            }
        ],
        hasMore: [
            false,
            {
                setHasMore: (_, {hasMore}) => hasMore
            }
        ]
    }),
    events(({actions}) => {
        afterMount: actions.load
    })
])
```

```tsx
import { useValues } from 'kea';

export default function Posts() {
    
    const { loadAjax, posts } = useValues(postsLogic)
    
    return loadAjax.status === 'loading' ? <Loader /> : <Posts posts={posts} />
    
}
```

Here, the `load` actions will be called when the component is mounted, because we added it to `events` in the logic. `loadAjax` is a reducer automatically set by the `ajax` plugin. The following is the interface of the `loadAjax` reducer.

```ts
interface KeaAjaxObject {
    status: null | 'loading' | 'success' | 'error',
    error: string | null,
}
```

You can use the `loadAjax` to show a loader, or even show an error component with the error message when the status is error.

## Calling actions manually

Let's see an example where you call an ajax action on a button click in React.

```ts
const usersLogic = kea([
    actions({
        addUser: (user: User) => ({user}),
    }),
    ajax(({actions}) => ({
        createUser: async ({name, email} : {name: string, email: string}) => {
            const user = await axois.post('/user', {name, email})
            actions.addUser(user)
        }
    })),
    reducers({
        users: [
            [],
            {
                addUser: (state, {user}) => [...state, user]
            }
        ]
    })
])
```

```tsx
function App() {
    
    const { createUser } = useActions(usersLogic)
    
    function handleClick() {
        createUser({
            name: "New User",
            email: "new@hyvor.com"
        })
    }
    
    // you can render a loading icon while the user is being created, by using `createUserAjax` value.
    
    return <button onClick={handleClick}>Add User</button>
    
}
```
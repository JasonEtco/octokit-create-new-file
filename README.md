# octokit-create-new-file

Creates a new file on a new branch and opens a new pull request.

## Usage

```js
const createNewFile = require('octokit-create-new-file')
const newPr = await createNewFile(octokit, {
  pr: {
    title: 'This is a new pull request',
    body: 'An extended description about this pull request.'
  },
  repo: {
    owner: 'Example',
    repo: 'Name'
  },
  commitMessage: 'Create a new file',
  file: {
    path: 'new-file.md',
    content: 'This is the content of the new file.'
  }
})

console.log(newPr)
// { number: 1, title: 'Example' }
```

##### [See the full API docs here](./docs/api.md)
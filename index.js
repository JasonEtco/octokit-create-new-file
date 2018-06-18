const slugify = require('slugify')

/**
 * Create a new file on a new branch and open a pull request
 *
 * @param {object} octokit - Octokit object
 * @param {Options} opts
 * @returns {Promise<Object>}
 */
async function createNewFile (octokit, opts) {
  const branchName = opts.pr.branch || `create-${slugify(opts.file.path, { lower: true })}`

  // Get the current "master" reference, to get the current master's sha
  const sha = await octokit.gitdata.getReference({
    ...opts.repo,
    ref: `heads/${opts.branch || 'master'}`
  })

  // Get the tree associated with master, and the content
  // of the template file to open the PR with.
  const tree = await octokit.gitdata.getTree({
    ...opts.repo,
    tree_sha: sha.data.object.sha
  })

  // Create a new blob with the existing template content
  const blob = await octokit.gitdata.createBlob({
    content: opts.file.content
  })

  const newTree = await octokit.gitdata.createTree({
    ...opts.repo,
    tree: [{
      path: opts.file.path,
      sha: blob.data.sha,
      mode: '100644',
      type: 'blob'
    }],
    base_tree: tree.data.sha
  })

  // Create a commit and a reference using the new tree
  const newCommit = await octokit.gitdata.createCommit({
    ...opts.repo,
    message: opts.commitMessage || `Create ${opts.file.path}`,
    parents: [sha.data.object.sha],
    tree: newTree.data.sha
  })

  await octokit.gitdata.createReference({
    ref: `refs/heads/${branchName}`,
    sha: newCommit.data.sha
  })

  const pr = await octokit.pullRequests.create({
    ...opts.repo,
    title: opts.pr.title || `Create ${opts.file.path}`,
    body: opts.pr.body,
    head: branchName,
    base: opts.pr.base || 'master'
  })

  return pr.data
}

/**
 * @typedef {Object} Options
 * @property {Object} pr - Pull Request object
 * @property {string} pr.title - Title of the new Pull Request
 * @property {string} [pr.body] - Body of the new Pull Request
 * @property {string} [pr.branch] - Name of the new branch to create. Defaults to `create-{{ file.path }}`
 * @property {string} [pr.base='master'] - Name of the base branch to use
 * @property {string} [commitMessage] - Commit message
 * @property {Object} repo - Repository object
 * @property {string} repo.owner - Repository owner
 * @property {string} repo.repo - Repository name
 * @property {Object} file - File object
 * @property {string} file.path - File path
 * @property {string} file.content - File content
 * @property {string} [file.encoding='utf8'] - File encoding, either `base64` or `utf8`
 */

module.exports = createNewFile

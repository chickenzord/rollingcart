// @ts-check

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        writerOpts: {
          commitsSort: ['subject', 'scope'],
          /**
           * @param {any} commit
           * @returns {any}
           */
          transform: (commit) => {
            // Skip merge commits
            if (commit.merge || /^Merge (pull request|branch)/i.test(commit.subject)) {
              return false;
            }
            // Shorten commit hash to 7 characters
            if (commit.hash) {
              commit.hash = commit.hash.substring(0, 7);
            }
            return commit;
          },
          /**
           * @param {any} context
           * @returns {any}
           */
          finalizeContext: (context) => {
            // Add Docker image instructions footer
            const codeBlock = '```';
            context.footer = `

## Docker Image

Pull the Docker image for this release:

${codeBlock}bash
docker pull ghcr.io/chickenzord/rollingcart:${context.version}
${codeBlock}

Or use the ${codeBlock}latest${codeBlock} tag:

${codeBlock}bash
docker pull ghcr.io/chickenzord/rollingcart:latest
${codeBlock}`;
            return context;
          },
        },
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failComment: false,
        releasedLabels: false,
        addReleases: 'bottom',
      },
    ],
  ],
};

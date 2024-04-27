> [!CAUTION]
> Not officially supported by Skyflow. Consider this alpha software which may have issues.

# Example: GraphQL - Apollo Server + Skyflow

## Introduction

Welcome to our guide on integrating GraphQL with Skyflow using Apollo Server and the Skyflow Node.js SDK. This post will walk you through creating a simple GraphQL API and enhancing its capabilities with Skyflow's data privacy vault.

**Understanding GraphQL and Apollo Server**

GraphQL is a powerful query language for APIs, offering more flexibility and efficiency than traditional REST APIs. Apollo Server is a popular open-source GraphQL server that simplifies building GraphQL APIs in Node.js.

**Introduction to Skyflow**

Skyflow offers a data privacy vault for securely handling sensitive data. Using Skyflow's Node.js SDK, we can seamlessly integrate this security into our GraphQL API.

**Setting Up the Environment**

First we'll set up our environment.

Ensure Node.js and npm are installed:

```bash
node -v
```

Create a directory for the project then `cd` into it in Terminal:

```bash
mkdir skyflow_apollo_server && cd skyflow_apollo_server
```

Initialize a new npm project:

```bash
npm init --yes && npm pkg set type="module"
```

Install Apollo Server and the Skyflow Node.js SDK: 

```bash
npm install apollo-server-standalone skyflow-node
```

Create our main JS file:

```bash
touch index.js
```

Replace `scripts` with the following in `package.json`, which was created when we ran `npm init`:

```json
{
  // ...
  "scripts": {
    "start": "node index.js"
  }
  // ...
}
```

Be sure to save that file.


## Building a privacy-first GraphQL server with Apollo and Skyflow

Now for the good stuff. Open index.js in your editor and let's begin.

First, let's import the dependencies and set up a basic "Hello world!" Apollo Server:

```javascript
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Skyflow } from 'skyflow-node';

// A schema is a collection of type definitions (hence "typeDefs")
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Resolvers define the technique for fetching the types defined in the schema
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

// The ApolloServer constructor requires two parameters: your schema definition and your set of resolvers
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

### Integrating the Skyflow Vault SDK


import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Skyflow, setLogLevel, LogLevel } from 'skyflow-node';
// ## Include environment variables from .env
import 'dotenv/config';

// ## DEV ONLY: set the log level to INFO
setLogLevel(LogLevel.DEBUG);

// ## Set up authentication and the Skyflow Vault client.
const client = Skyflow.init({
  vaultID: process.env.VAULT_ID || '',
  vaultURL: process.env.VAULT_URL || '',
  // getBearerToken expects a function which returns a promise with the bearer token
  getBearerToken: function () {
    return new Promise((resolve, reject) => {
      resolve(process.env.VAULT_ACCESS_TOKEN || '');
    });
  },
});



// Define the GraphQL schema
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  schema {
    query: Query
    # mutation: Mutation
  }

  type Record {
    id: ID!
    table: String!
    fields: Fields!
  }

  type Token {
    token: String
    value: String!
    tokenGroup: String
  }

  # customized per table
  type Fields {
    name: String
    ssn: String
    email: String
  }

  # users
  type User {
    fields: Fields!
  }

  # Query definitions
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    # get record(s) by ID(s)
    getRecords(table: String! ids: [ID!] tokensBool: Boolean): [Record]
    # detokenize tokens
    detokenize(tokens: [String!]): [Token]
    # get users records by ID
    getUsers(ids: [ID!] tokensBool: Boolean) :[User]
  }

  # type Mutation {
  #   insertRecord(name: String!, fields: String!): Record
  # }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.

const resolvers = {
  Query: {
    async detokenize(parent, args, contextValue, info) {
      // construct the request payload
      const recordsForRequest = args.tokens.map((requestedToken) => {
        return { token: requestedToken };
      });
      const requestPayload = {
        records: recordsForRequest
      };
      try {
        const response = await client.detokenize(requestPayload);
        return response.records;
      }
      catch (error) {
        console.log(JSON.stringify(error));
        return null;
      }
    },
    async getRecords(parent, args, contextValue, info) {
      // construct the request payload
      const requestPayload = {
        records: [
          {
            ids: args.ids,
            table: args.table,
            redaction: args.tokensBool ? null : Skyflow.RedactionType.PLAIN_TEXT
          }
        ]
      };
      try {
        const response = await client.get(requestPayload, { tokens: args.tokensBool });
        return response["records"];
      }
      catch (error) {
        console.log(JSON.stringify(error));
        return null;
      }
    },
    async getUsers(parent, args, contextValue, info) {
      // construct the request payload
      const requestPayload = {
        records: [
          {
            table: "users",
            ids: args.ids,
            redaction: args.tokensBool ? null : Skyflow.RedactionType.PLAIN_TEXT
          }
        ]
      };
      try {
        const response = await client.get(requestPayload, { tokens: args.tokensBool });
        return response.records;
      }
      catch (error) {
        console.log(JSON.stringify(error));
        return null;
      }
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);


// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
  },
  links: {},
  rooms: {
    lobby: {
      presence: i.entity({
        name: i.string().optional(),
        id: i.string().unique().indexed(),
        score: i.number().optional(),
        wordsSolved: i.number().optional(),
        isHost: i.boolean().optional(),
        strikes: i.number().optional(),
        ready: i.boolean().optional(),
        isSpectator: i.boolean().optional(),
        isFinished: i.boolean().optional(), // Track if the player has finished the game
      }),
      topics: {
        sendBroadcast: i.entity({
          message: i.string(),
          to: i.string().optional(),
          type: i.string().optional(),
          wordSequence: i.string().optional(), // Allow wordSequence in topic events
          data: i.any().optional(), // Allow any additional data
        }),
      },
      wordSequence: i.string().optional(), // Store the sequence of words as a JSON string
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;

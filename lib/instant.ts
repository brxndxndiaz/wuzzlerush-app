import schema from "@/instant.schema";
import { init, i, InstaQLEntity } from "@instantdb/react-native";

// export type Users = InstaQLEntity<typeof schema, "users">;
// export type Attendees = InstaQLEntity<typeof schema, "attendees">;
// export type LikedEvents = InstaQLEntity<typeof schema, "likedEvents">;
// export type Staff = InstaQLEntity<typeof schema, "staff">;
// export type Events = InstaQLEntity<typeof schema, "events">;
// export type EventTickets = InstaQLEntity<typeof schema, "eventTickets">;
// export type EventTicketPricing = InstaQLEntity<
//   typeof schema,
//   "eventTicketPricing"
// >;
// export type EventLineup = InstaQLEntity<typeof schema, "eventLineup">;
// export type Transactions = InstaQLEntity<typeof schema, "transactions">;
// export type Receipts = InstaQLEntity<typeof schema, "receipts">;
// export type Devices = InstaQLEntity<typeof schema, "devices">;

// Initialize InstantDB with schema
export const db = init({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID as any,
  schema: schema,
  devtool: false,
});


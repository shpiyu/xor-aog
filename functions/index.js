"use strict";
const { dialogflow, Suggestions } = require("actions-on-google");
const functions = require("firebase-functions");
const app = dialogflow({ debug: true });
const {
  searchMeetingRoom,
  bookMeetingRoom
} = require("./meeting_room/meetingRoomController");

app.intent(
  "search meeting room",
  (conv, { person_count, date, duration, time }) => {
    // Present user with the corresponding basic card and end the conversation.
    const rooms = searchMeetingRoom(person_count, date, duration, time);
    conv.user.storage = {
      pc: person_count,
      date: date,
      duration: duration.amount,
      time: time
    };
    if (rooms.length > 0) {
      conv.add("Please select your meeting room ");
      const room_names = rooms.map(r => r.name);
      conv.ask(new Suggestions(room_names));
    } else {
      conv.close("Ghar ja");
    }
  }
);

app.intent("search meeting room - book", (conv, { meeting_room }) => {
  if (
    bookMeetingRoom(
      meeting_room,
      conv.user.storage.time,
      conv.user.storage.duration
    )
  ) {
    conv.ask(
      "Great, your meeting room has been booked. bla bla, Would you like to do anything else?"
    );
  } else {
    conv.ask(
      "Sorry, the room could not be booked, would you like to do something else?"
    );
  }
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

/*********** test ************* */

bookMeetingRoom("Jogiya", "2018-12-09T12:45:02.391Z", 4);

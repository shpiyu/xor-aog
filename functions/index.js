"use strict";
const { dialogflow, Suggestions } = require("actions-on-google");
const functions = require("firebase-functions");
const app = dialogflow({ debug: true });
const {
  searchMeetingRoom,
  bookMeetingRoom
} = require("./meeting_room/meetingRoomController");
const {
  nextHoliday,
  nextLongWeekend
} = require("./holidays/holidayController");
const {
  fetchTravelRequestsFromXoriant,
  getUpcomingTravelRequests
} = require("./etravel/etravelCoontroller");
const { sendEmail } = require("./meeting_room/meetingRoomController");

app.intent("Default Welcome Intent", conv => {
  let response;
  if (conv.user.storage.userFirstName) {
    response = `Hi ${conv.user.storage.userFirstName}, what can I do for you?`;
  } else {
    response = `Hello, what can I do for you?`;
  }
  conv.ask(response);
});

app.intent("ask xoriant mail id", (conv, { email }) => {
  let response;
  if (email) {
    conv.user.storage.emailId = email;
    response = `Thanks, I'll remember your email id. Is there anything else that I can do for you?`;
  } else {
    response = `Sorry, your email id could not be saved. Anything else that I can do for you?`;
  }

  conv.ask(response);
});

app.intent(
  "search meeting room",
  (conv, { person_count, date, duration, time }) => {
    // Present user with the corresponding basic card and end the conversation.
    const rooms = searchMeetingRoom(person_count, date, duration, time);
    conv.data = {
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
      conv.close("Sorry, meeting room is not available.");
    }
  }
);

app.intent("search meeting room - book", (conv, { meeting_room }) => {
  let response;
  if (bookMeetingRoom(meeting_room, conv.data.time, conv.data.duration)) {
    response = "Great, your meeting room has been booked.";
    if (conv.user.storage.emailId) {
      sendEmail(
        meeting_room,
        conv.data.time,
        conv.data.duration,
        conv.user.storage.emailId
      );
    } else {
      response +=
        " If you could tell me your email, I'll send you the confirmation mail.";
    }
  } else {
    response =
      "Sorry, the room could not be booked, would you like to do something else?";
  }

  conv.ask(response);
});

app.intent("next holiday", conv => {
  const holiday = nextHoliday();
  const response = `The next holiday in Xoriant is on ${holiday.date.toLocaleDateString()} , on the occasion of ${
    holiday.name
  }`;
  conv.close(response);
});

app.intent("long weekend", conv => {
  const longWeekend = nextLongWeekend();
  let response;
  // if (longWeekend.leave) {
  response = `If you take a leave on ${longWeekend.leave.toLocaleDateString()} then you
                can turn your ${longWeekend.holiday} into a ${
    longWeekend.days
  } days vacation.`;
  // } else {
  //   response = `If you are hearing this, probably things are not working or the hackathon has ended`
  // }
  conv.close(response);
});

app.intent("upcoming etravel requests", conv => {
  fetchTravelRequestsFromXoriant
    .then(data => {
      conv.close(JSON.stringify(data));
    })
    .catch(err => {
      conv.close("hooo");
    });
});
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

"use strict";
const { dialogflow, Suggestions, List } = require("actions-on-google");
const functions = require("firebase-functions");
const app = dialogflow({ debug: true });
const { sendEmail, searchMeetingRooms, bookMeetingRoom, CheckRoomAvailabilty } = require("./meeting_room/meetingRoomController");
const { nextHoliday, nextLongWeekend } = require("./holidays/holidayController");
const { fetchTravelRequestsFromXoriant, getUpcomingTravelRequests } = require("./etravel/etravelCoontroller");
const { fetchUserDetail } = require("./user_info/user_info");

app.intent("Default Welcome Intent", conv => {
  let response;
  if (conv.user.storage.userFirstName) {
    response = `Hi ${conv.user.storage.userFirstName}, what can I do for you?`;
  } else {
    response = `Hello, what can I do for you?`;
  }
  conv.ask(response);
});

let updateUserInfo = function (email) {
  conv.user.storage.emailId = email;
};

app.intent("ask xoriant mail id", (conv, {
  email
}) => {
  let response;
  if (email) {
    updateUserInfo(conv, email);
    response = `Thanks, I'll remember your email id. Is there anything else that I can do for you?`;
  } else {
    response = `Sorry, your email id could not be saved. Anything else that I can do for you?`;
  }

  conv.ask(response);
});

app.intent(
  "search meeting room",
  (conv, {
    person_count,
    date,
    duration,
    time,
    meeting_rooms,
    time_period
  }) => {
    let response;
    conv.data = {
      pc: person_count,
      date: date,
      duration: duration.amount,
      time: time
    };
    if (meeting_rooms) {
      if (CheckRoomAvailabilty(person_count, time, meeting_rooms)) {
        bookMeetingRoom(meeting_rooms, time, duration.amount);
        conv.ask(`Great! ${meeting_rooms} has been booked. Is there anything else that I can do?`);
      } else {
        let resp = `Oh, it looks like ${meeting_rooms} is already booked by someone at that time.`;
        let availableRooms = searchMeetingRooms(person_count, date, duration.amount, time);
        if (availableRooms.length > 0) {
          resp += `You can book following rooms instead`;
          const suggs = availableRooms.map(room => room.name);
          conv.ask(resp, new Suggestions(suggs));
        } else {
          conv.ask(`Sorry, no rooms are available. Can I do something else for you?`);
        }
      }
    } else {
      const rooms = searchMeetingRooms(person_count, date, duration.amount, time);
      
      if (rooms.length > 0) {
        conv.ask("Please select your meeting room ");
        const room_names = rooms.map(r => r.name);
        conv.ask(new Suggestions(room_names));
      } else {
        conv.close("Alas, no meeting rooms are available at the  moment. Please try again later");
      }
    }
  }
);

app.intent("search meeting room - book", (conv, {
  meeting_room
}) => {
    bookMeetingRoom(meeting_room, conv.data.time, conv.data.duration);
    conv.ask(`Great! ${meeting_room} has been booked. Would you like me to do anything else for you?`);
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
    //  conv.ask('Here are your scheduled bookings');

    return new Promise((res, rej) => {
      fetchTravelRequestsFromXoriant()
        .then(data => {
          let requests = JSON.parse(data).data;

          requests.forEach(req => {
            let key = new Date(
              req.request.earliestTravelDate
            ).toLocaleDateString();
            let val = {};
            val.title = key;
            val.description = req.request.purpose_value;

            CAB_BOOOKINGS[key] = val;
          });
          // conv.ask(new SimpleResponse({
          //   speech: 'Here are your scheduled bookings',
          //   text: 'Here are your scheduled bookings',
          // }),new List(CAB_BOOOKINGS));
          conv.ask(`Your upcoming cab request is  
                  for ${requests[0].request.purpose_value}`);
          res();
        })
        .catch(err => {
          conv.close("hooo");
        });
    });
  });
  // Set the DialogflowApp object to handle the HTTPS POST request.
  exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);



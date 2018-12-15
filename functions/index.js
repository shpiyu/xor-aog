"use strict";
const {
  dialogflow,
  Suggestions,
  List
} = require("actions-on-google");
const functions = require("firebase-functions");
const app = dialogflow({
  debug: true
});
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
const {
  sendEmail
} = require("./meeting_room/meetingRoomController");
const {
  fetchUserDetail
} = require("./user_info/user_info");

app.intent("Default Welcome Intent", conv => {
  let response;
  if (conv.user.storage.userFirstName) {
    response = `Hi ${conv.user.storage.userFirstName}, what can I do for you?`;
  } else {
    response = `Hello, what can I do for you?`;
  }
  conv.ask(response);
});

const CAB_BOOOKINGS = {
  title: 'Your Requests',
  items: {
    // "SELECTION_KEY_ONE": {
      
    //   title: 'Title of First List Item',
    //   description: 'This is a description of a list item.',
    //   // image: new Image({
    //   //   url: IMG_URL_AOG,
    //   //   alt: 'Image alternate text',
    //   // }),
    // },
    
  }
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

let updateUserInfo = function (conv, email) {
  conv.user.storage.emailId = email;
  fetchUserDetail().then(data => {
    conv.user.storage.userFirstName = JSON.parse(data).data.firstname;
  });
}

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

    if (meeting_rooms) {
      conv.data.time = time;
      conv.data.duration = duration;
      let response = tryBookingRoom(conv, meeting_rooms);
      conv.ask(response);
    } else {
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
  }
);

app.intent("search meeting room - book", (conv, {
  meeting_room
}) => {
  let response = tryBookingRoom(conv, meeting_room);
  conv.ask(response);
});

let tryBookingRoom = function (conv, meeting_room) {
  let response;
  if (
    bookMeetingRoom(
      meeting_room,
      conv.data.time,
      conv.data.duration
    )
  ) {
    response = "Great, your meeting room has been booked. Would you like me to do anything else";
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
    response = "Sorry, the room could not be booked,  would you like me to do something else?";
  }
  return response;
}

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
    fetchTravelRequestsFromXoriant().then(data => {
        let requests = JSON.parse(data).data;
        
        
        requests.forEach(req => {
          let key = new Date(req.request.earliestTravelDate).toLocaleDateString();
          let val = {};
          val.title = key;
          val.description = req.request.purpose_value;

          CAB_BOOOKINGS[key] = val;

        })
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
  })
});
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
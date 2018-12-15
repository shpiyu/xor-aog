const {
    searchMeetingRoom,
    bookMeetingRoom,
    CheckRoomAvailabilty
  } = require("./meeting_room/meetingRoomController");

test = function(conv, meeting_room) {
    let response;
  let rooms = CheckRoomAvailabilty(
    conv.data.person_count = 4,
    conv.data.date,
    conv.data.duration = 1,
    conv.data.time = new Date(),
    meeting_room
  );

    console.log(rooms);

  if (rooms.value == true) {
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
        "Sorry, the room could not be booked,  would you like me to do something else?";
    }
  } else {
    if (rooms.list.length > 0) {
      response = meeting_room + " is not available";
      response += "You can try with following rooms ";
      const room_names = rooms.list.map(r => r.name);
      console.log(room_names);
      return response;
    } else {
      console.log("Sorry, meeting room is not available.");
    }
  }

  return response;
}

test({ data: {} },"Kafi");
const {
    searchMeetingRooms,
    bookMeetingRoom,
    CheckRoomAvailabilty
  } = require("./meeting_room/meetingRoomController");

test = function(conv, person_count,
  date,
  time,
  duration,
  meeting_rooms,) {
  conv.data = {
    pc: person_count,
    date: date,
    time: time
  };
  if (meeting_rooms) {
    // conv.data.time = time;
    // conv.data.duration = duration;
    // let response = tryBookingRoom(conv, meeting_rooms);
    // conv.ask(response);
    if (CheckRoomAvailabilty(person_count, time, meeting_rooms)) {
      bookMeetingRoom(meeting_rooms, time, duration);
      console.log(`Great! ${meeting_rooms} has been booked for your meeting at ${time}. Would you like me to do anything else for you?`);
    } else {
      let resp = `Oh, it looks like ${meeting_rooms} is already booked by someone at ${time}.`;
      let availableRooms = searchMeetingRooms(person_count, date, duration, time);
      if (availableRooms.length > 0) {
        resp += `But I can see that some other rooms are available for ${person_count} people at ${time}`;
        const suggs = availableRooms.map(room => room.name);
        conv.ask(resp, new Suggestions(suggs));
      } else {
        conv.ask(`Sorry, no rooms are available. Can I do something else for you?`);
      }
    }
  } else {
    const rooms = searchMeetingRooms(person_count, date, duration, time);
    
    if (rooms.length > 0) {
      conv.ask("Please select your meeting room ");
      const room_names = rooms.map(r => r.name);
      conv.ask(new Suggestions(room_names));
    } else {
      conv.close("Alas, no meeting rooms are available at the  moment. Please try again later");
    }
  }
}

test({ data: {} },3,"","2018-12-15T14:00:00.914Z",2,"Kafi");
test({ data: {} },3,"","2018-12-15T14:00:00.914Z",2,"Kafi");
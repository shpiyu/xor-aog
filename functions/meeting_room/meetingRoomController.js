const { rooms } = require("./meetingRoomDb");

exports.searchMeetingRoom = function(person_count, date, duration, time) {
  // time in hours only
  console.log(person_count, date, duration, time);
  let r = rooms.filter(
    room => checkCapacity(room, person_count) && checkTime(room, time)
  );

  console.log(r);
  return r;
};

checkCapacity = function(room, person_count) {
  return room.capacity >= person_count;
};

checkTime = function(room, time) {
  let hour = new Date(time).getHours();
  let position = hour % 9;
  return room.time[position] !== 1;
};

exports.bookMeetingRoom = function(room_name, time, duration) {
  let hour = new Date(time).getHours();
  let position = hour % 9;
  while (duration > 0) {
    duration--;
    let room = rooms.filter(r => r.name === room_name);
    room[0].time[position] = 1;
    position++;
  }

  return true;
};

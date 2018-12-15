const { rooms } = require("./meetingRoomDb");
const nodemailer = require("nodemailer");

exports.searchMeetingRooms = function(person_count, date, duration, time) {
  // time in hours only
  let r = rooms.filter(
    room => checkCapacity(room, person_count) && checkTime(room, time)
  );
  return r;
};
exports.CheckRoomAvailabilty = function(person_count, time, meeting_room) {
  return checkCapacity(meeting_room, person_count) && checkTime(meeting_room, time);
}
// exports.CheckRoomAvailabilty = function(
//   person_count,
//   time,
//   meeting_room
// ) {
//   if (
//     checkCapacity(meeting_room, person_count) &&
//     checkTime(meeting_room, time)
//   ) {
//     return { list: [], value: true };
//   } else {
//     console.log(person_count, time);
//     let r = rooms.filter(
//       room => checkCapacity(room, person_count) && checkTime(room, time)
//     );
//     console.log(r);
//     return { list: r, value: false };
//   }
// };

let checkCapacity = function(room, person_count) {
  return room.capacity >= person_count;
};

let checkTime = function(room, time) {
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

exports.sendEmail = function(
  meeting_room,
  start_time,
  duration,
  toEmail = "aishwaryayeole@gmail.com"
) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "xor.aog@gmail.com",
      pass: "xoraog123"
    }
  });
  var email_header =
    "Hi, \n" + " You have booked " + meeting_room + " meeting room from ";

  var email_booked_time_slot =
    new Date(start_time).getHours() > 12
      ? new Date(start_time).getHours() - 12 + " PM "
      : new Date(start_time).getHours() + " AM ";

  var email_footer =
    " for " + duration + " hours. \n\n Regards, \n Xornet Team";

  var reply = email_header + email_booked_time_slot + email_footer;

  var mailOptions = {
    from: "xor.aog@gmail.com",
    to: toEmail,
    subject: meeting_room + " booked",
    text: reply
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.info(error);
    } else {
      console.info("Email sent: " + info.response);
    }
  });
};

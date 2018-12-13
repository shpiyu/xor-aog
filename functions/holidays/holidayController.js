const { holidays } = require('./holidaylist');

exports.nextHoliday = function(date = new Date()) {
    const keys = Object.keys(holidays);
    for(let i=0; i<keys.length; i++) {
        if (new Date(keys[i]) > date) {
            return {
                "name": holidays[keys[i]],
                "date": new Date(keys[i])
            };
        }
    }
}

exports.nextLongWeekend = function(date = new Date()) {
    const keys = Object.keys(holidays);
    for (let i=0 ;i<keys.length; i++) {
        if (new Date(keys[i]) > date && canBeALongWeekend(new Date(keys[i]))) {
            return getLongWeekends(new Date(keys[i]));
        }
    }
}

function canBeALongWeekend(date) {
    return [1,2,4,5].indexOf(date.getDay());
}

function getLongWeekends(date) {
    const holiday = holidays[date.toISOString()];
    let leave = new Date(date);
    let days;

    switch(date.getDay()) {
        case 2:
            leave.setDate(date.getDate() - 1);
            days = 4;
            break;
        case 4:
            leave.setDate(date.getDate() + 1);
            days = 4;
            break; 
        default:
            leave = null;
            days = 3;

    }

    return {
        "holiday": holiday,
        "leave": leave,
        "days": days
    }
}

exports.getHolidayList = function(date = new Date()) {
    let list = Object.keys(holidays).map(holiday => new Date(holiday));
    console.log(list);
    let pos;
    for(let i=0; i<list.length; i++) {
        if (date < list[i]) {
            pos = i;
            break;
        }
    }
    console.log(pos);

    // TODO : returns a list of ISO date strings, should return hoiday object.
    return list.slice(pos, ((pos + 5) > list.length ? list.length : pos + 5 ));
    
    
}
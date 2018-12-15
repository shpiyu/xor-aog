const rp = require('request-promise');
  
exports.fetchTravelRequestsFromXoriant = function() {
   

    var form = { "emailid" : "Piyush.Ranjan@Xoriant.com", "screen" : "USER", "status" : "ALL","requestPeriod" :"Upcoming_Requests" };

    var formData = JSON.stringify(form);
    var options = {
        headers: {
        'Content-Type': 'application/json',
        'Host': 'e-travel.xoriant.com'
        },
        uri: 'https://e-travel.xoriant.com/internal/secure/getUserTravelRequests',
        body: formData,
        method: 'POST'
    }

    return rp(options).then(data => data);

}

// exports.fetchTravelRequestsFromXoriant().then(data => console.log(JSON.parse(data).data[0].request.id));
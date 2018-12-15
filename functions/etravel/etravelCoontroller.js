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


exports.getTravelDetail = function(reqId = 1489) {
    var form = {
        "requestId": reqId,
        "emailid": "Piyush.Ranjan@Xoriant.Com"
      };

    var formData = JSON.stringify(form);
    var options = {
        headers: {
        'Content-Type': 'application/json',
        'Host': 'e-travel.xoriant.com'
        },
        uri: 'https://e-travel.xoriant.com/internal/secure/modifyRequest',
        body: formData,
        method: 'POST'
    }

    return rp(options).then(data => JSON.parse(data).data.cab.cabDetails[0]);
}

// exports.fetchTravelRequestsFromXoriant().then(data => console.log(JSON.parse(data).data[0].request.id));

// exports.getTravelDetail().then(data => console.log(data));
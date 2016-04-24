Template.hangout.onCreated(function() {
  var title = "CodeBuddies | Hangout";
  DocHead.setTitle(title);
  var self = this;
  self.hangout = new ReactiveVar();
  self.isReady = new ReactiveVar(false);

  var hangoutId = FlowRouter.getParam('hangoutId');
  self.autorun(function() {
    var result = ReactiveMethod.call('getHangout', hangoutId);
    self.hangout.set(result);
    self.isReady.set(true);
  });
});

Template.hangout.helpers({
  hangout: function() {
    if (Template.instance().isReady.get())
      return Template.instance().hangout.get();
  },
  isReady: function() {
    return Template.instance().isReady.get();
  },
  getType: function(type) {
    if (type == 'silent') {
      return 'fa-microphone-slash text-danger-color';
    } else if (type == 'teaching') {
      return 'fa-user text-warning-color';
    } else if (type == 'collaboration') {
      return 'fa-users text-success-color';
    }
  },
  host: function(hangout) {
    var user = ReactiveMethod.call('getUserName', hangout.user_id);
    return user;
  },
  getDate: function(hangout) {
    var tz = TimezonePicker.detectedZone();
    //console.log('getDate tz: ' + tz);
    //console.log('getDate hangout.start: '+ hangout.start);
    //console.log('getDate hangout.end: '+ hangout.end);
    //console.log('getDate this.timestamp' + this.timestamp);
    //console.log('getDate this.end' + this.end)
    return moment(hangout.start).tz(tz).format('MMMM Do YYYY, h:mm a z') +
      ' - ' +
      moment(hangout.end).tz(tz).format('MMMM Do h:mm a z') +
      ' | ' +
      hangout.users.length +
      ' joined';
  },
  isInProgress: function(hangout) {

    var hangout_links = {
      'http://codebuddies.org/javascript-hangout': 'free',
      'http://codebuddies.org/meteor-hangout': 'free',
      'http://codebuddies.org/python-hangout': 'free'
    }

    return reactiveDate.nowMinutes.get() > hangout.start && reactiveDate.nowMinutes.get() < hangout.end;

    //return reactiveDate.nowMinutes.get() > hangout.start && reactiveDate.nowMinutes.get() < hangout.end;

  },
  completed: function(hangout) {
        return reactiveDate.nowMinutes.get() > hangout.end;
  },
  isJoined: function() {
    return this.users.indexOf(Meteor.userId()) != -1;
  },

  isHost: function() {
    return this.user_id === Meteor.userId();
  },
  upcomingTime: function(hangout) {
    var startDate = new Date(hangout.start);
    var currentDate = new Date();
    if (startDate > currentDate) {
          return TAPi18n.__("upcoming_time", {
          time: moment(startDate).fromNow()
        });
    }

  },
  getIsDone: function(hangout) {
    var currentDate = new Date();
    //console.log('getIsDone currentDate:' + currentDate);
    var hangoutDate = new Date(hangout.end);
    if (hangoutDate < currentDate) {
      var daysDiff = Math.round((currentDate - hangoutDate) / (1000 * 60 * 60 * 24));
      if (daysDiff == 0)
        return TAPi18n.__("mastered_today_time", {
          time: moment(hangoutDate).fromNow()
        });
      else
        return TAPi18n.__("mastered_x_days_ago", {
          days: daysDiff
        });
    } else {
      return '';
    }
  }
});
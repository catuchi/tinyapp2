const { assert } = require('chai');

const { findUserByEmail } = require('../helpers/helperFunctions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert(user.id === expectedUserID, 'user.id should be equal to expectedUserID');
  });
  
  it('should return a user with valid email', function() {
    const user = findUserByEmail("appm", testUsers)
    assert(user === undefined, 'user should be undefined');
  });


});
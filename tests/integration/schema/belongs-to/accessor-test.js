import BelongsToHelper from './belongs-to-helper';
import {module, test} from 'qunit';

module('mirage:integration:schema:belongsTo#accessor', {
  beforeEach: function() {
    this.helper = new BelongsToHelper();
  }
});

/*
  #association behavior works regardless of the state of the child
*/

[
  'savedChildNoParent',
  'savedChildNewParent',
  'savedChildSavedParent',
  'newChildNoParent',
  'newChildNewParent',
  'newChildSavedParent',
].forEach(state => {

  test(`the references of a ${state} are correct`, function(assert) {
    var [address, user] = this.helper[state]();

    assert.deepEqual(address.user, user ? user : null, 'the model reference is correct');
    assert.equal(address.user_id, user ? user.id : null, 'the model_id reference is correct');
  });

});

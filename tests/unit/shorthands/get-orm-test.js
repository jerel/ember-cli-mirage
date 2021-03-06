import {module, test} from 'qunit';
import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import Server from 'ember-cli-mirage/server';
import Mirage from 'ember-cli-mirage';
import get from 'ember-cli-mirage/shorthands/get';

module('mirage:shorthands#get-with-orm', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      modelsMap: {
        author: Model.extend({
          posts: Mirage.hasMany()
        }),
        post: Model.extend({
          author: Mirage.belongsTo(),
          comments: Mirage.hasMany()
        }),
        comment: Model.extend({
          post: Mirage.belongsTo()
        }),
        photo: Model
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.authors = [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'},
      {id: 3, name: 'Epona'}
    ];
    this.posts = [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1}
    ];
    this.photos = [
      {id: 1, title: 'Amazing', location: 'Hyrule'},
      {id: 2, title: 'Photo', location: 'Goron City'}
    ];
    this.server.db.loadData({
      authors: this.authors,
      posts: this.posts,
      photos: this.photos,
    });

    this.schema = this.server.schema;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

/*
  These tests ensure the shorthands, when used with the orm model definitions,
  return the appropriate models/collections.
*/

test('undefined shorthand returns the collection of models', function(assert) {
  let authors = get.undefined(undefined, this.schema, {url: '/authors'});

  assert.equal(authors.length, 3);
  assert.ok(authors[0] instanceof Model);
  assert.equal(authors[0].type, 'author');
});

test('undefined shorthand ignores query params', function(assert) {
  let authors = get.undefined(undefined, this.schema, {url: '/authors?foo=bar'});

  assert.equal(authors.length, 3);
  assert.ok(authors[0] instanceof Model);
  assert.equal(authors[0].type, 'author');
});

test('undefined shorthand can return a single model', function(assert) {
  let author = get.undefined(undefined, this.schema, {url: '/authors/2', params: {id: 2}});

  assert.ok(author instanceof Model);
  assert.equal(author.type, 'author');
  assert.equal(author.name, 'Zelda');
});

test('undefined shorthand returns null if a singular resource does not exist', function(assert) {
  let author = get.undefined(undefined, this.schema, {url: '/authors/99', params: {id: 99}});

  assert.ok(author === null);
});

test('undefined shorthand ignores query params for a singular resource', function(assert) {
  let author = get.undefined(undefined, this.schema, {url: '/authors/2?foo=bar', params: {id: 2}});

  assert.ok(author instanceof Model);
  assert.equal(author.type, 'author');
  assert.equal(author.name, 'Zelda');
});

test('undefined shorthand with coalesce true returns the appropriate models', function(assert) {
  let authors = get.undefined(undefined, this.schema, {url: '/authors?ids[]=1&ids[]=3', queryParams: {ids: [1, 3]}}, {coalesce: true});

  assert.equal(authors.length, 2);
  assert.deepEqual(authors.map(author => author.name), ['Link', 'Epona']);
});

test('string shorthand returns the correct collection of models', function(assert) {
  this.server.get('/people', 'authors');
  let authors = get.string('authors', this.schema, {url: '/people'});

  assert.equal(authors.length, 3);
  assert.ok(authors[0] instanceof Model);
  assert.equal(authors[0].type, 'author');
});

test('string shorthand with an id returns the correct model', function(assert) {
  let author = get.string('author', this.schema, {url: '/people/2', params: {id: 2}});

  assert.ok(author instanceof Model);
  assert.equal(author.type, 'author');
  assert.equal(author.name, 'Zelda');
});

test('string shorthand with an id returns null if the model is not found', function(assert) {
  let author = get.string('author', this.schema, {url: '/people/99', params: {id: 99}});

  assert.ok(author === null);
});

test('string shorthand with coalesce returns the correct models', function(assert) {
  let authors = get.string('author', this.schema, {url: '/people?ids[]=1&ids[]=3', queryParams: {ids: [1, 3]}}, {coalesce: true});

  assert.equal(authors.length, 2);
  assert.deepEqual(authors.map(author => author.name), ['Link', 'Epona']);
});

test('array shorthand returns the correct models', function(assert) {
  let models = get.array(['authors', 'photos'], this.schema, {url: '/home'});

  assert.ok(models[0] instanceof Collection);
  assert.equal(models[0].type, 'author');
  assert.equal(models[0].length, this.authors.length);

  assert.ok(models[1] instanceof Collection);
  assert.equal(models[1].type, 'photo');
  assert.equal(models[1].length, this.photos.length);
});

test('array shorthand for a singular resource errors', function(assert) {
  assert.throws(function() {
    get.array(['author', 'posts'], this.schema, {url: '/authors/1', params: {id: 1}});
  }, /create a serializer/);
});

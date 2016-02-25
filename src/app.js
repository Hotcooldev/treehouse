import Cursor from './cursor'
import arrayMutators from './mutators/array_mutators'
import objectMutators from './mutators/object_mutators'
import Queries from './queries'
import Filters from './filters'
import TreeView from './tree_view'
import Actions from './actions'
import DirtyTracker from './dirty_tracker'
import reactComponentMethods from './react_component_methods'

class App {

  constructor (data={}) {
    this._tree = data
    this.dirtyTracker = new DirtyTracker()
    this.actions = new Actions(this)
    this._mutators = {}
    this.queries = new Queries(this)
    this.filters = new Filters(this)

    this.registerMutators(arrayMutators)
    this.registerMutators(objectMutators)
  }

  // Tree

  tree () {
    return this._tree
  }

  setTree (data, channels) {
    this._tree = data
    this.dirtyTracker.markChannelDirty(channels)
  }

  init (data) {
    this.setTree(data)
  }

  // Cursors

  trunk () {
    return (this._trunk = this._trunk || this.at([]))
  }

  at (...path) {
    if (Array.isArray(path[0])) {
      path = path[0]
    }
    return new Cursor(this, path)
  }

  // Queries

  registerQueries (queries) {
    this.queries.register(queries)
  }

  query (name, args) {
    return this.queries.build(name, args)
  }

  // Mutators

  registerMutators (mutators) {
    Object.assign(this._mutators, mutators)
  }

  mutators () {
    return this._mutators
  }

  // Filters

  registerFilters (filters) {
    this.filters.register(filters)
  }

  buildFilteredStream (name, source, args) {
    return this.filters.buildStream(name, source, args)
  }

  // TreeView

  pick (callback) {
    return new TreeView(this, callback)
  }

  // Actions

  registerActions (actions) {
    this.actions.register(actions)
  }

  action (name, payload) {
    this.actions.do(name, payload)
  }

  // Dirty Tracker

  commit () {
    this.dirtyTracker.cleanAllDirty()
  }

  // React

  extendReact (object) {
    object.treehouse = this
    Object.assign(object, reactComponentMethods)
  }

}

export default App

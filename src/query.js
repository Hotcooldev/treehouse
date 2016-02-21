import shallowCompare from './shallow_compare'

class Query {

  constructor (app, getDependencies, args, getter) {
    this.treeView = app.pick(getDependencies || {})
    this.args = args
    this.getter = getter
    this.state = null
  }

  get () {
    let currentState = this.treeView.get()
    if (!this.state || !shallowCompare(this.state, currentState)) {
      this.result = this.getter(currentState, this.args)
      this.state = currentState
    }
    return this.result
  }

  set () {
    throw new Error("Setting from a query not implemented yet")
  }

  channels () {
    return this.treeView.channels()
  }
}

export default Query

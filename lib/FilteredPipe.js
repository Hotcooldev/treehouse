class FilteredPipe {

  static create (app, source, nameOrSpec, args) {
    let name, spec
    if (typeof nameOrSpec === 'string') {
      name = nameOrSpec
      spec = app.filters.find(name)
    } else {
      name = 'anonymous'
      spec = nameOrSpec
    }
    return new this(app, source, name, spec, args)
  }

  constructor (app, source, name, spec, args) {
    this.app = app
    this.source = source
    this.name = name
    this.spec = spec
    this.args = args
  }

  filterFn () {
    if (!this._filterFn) {
      this._filterFn = typeof(this.spec) === 'function' ? this.spec : this.spec.filter
    }
    return this._filterFn
  }

  unfilterFn () {
    if (!this.spec.unfilter) {
      throw new Error(`You need to implement 'unfilter' on the '${this.name}' filter to be able to set through it`)
    } else {
      return this.spec.unfilter
    }
  }

  pull () {
    return this.filterFn()(this.source.pull(), this.args)
  }

  push (value) {
    return this.source.push(this.unfilterFn()(value, this.args))
  }

  channels () {
    return this.source.channels()
  }

  filter (nameOrSpec, args) {
    return this.constructor.create(this.app, this, nameOrSpec, args)
  }
}

module.exports = FilteredPipe
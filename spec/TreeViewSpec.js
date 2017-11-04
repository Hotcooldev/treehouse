const TreeView = require('../lib/TreeView')
const DirtyTracker = require('../lib/DirtyTracker')

class Source {
  pull () {}
  channels () {}
}

describe("TreeView", () => {

  let treeView, tree, picker, dirtyTracker, source

  beforeEach(() => {
    tree = {}
    dirtyTracker = new DirtyTracker()
    picker = jasmine.createSpy('picker')
    source = new Source()
  })

  describe("resolving the source", () => {

    it("picks the bundle if an object is given", () => {
      spyOn(source, 'pull').and.returnValue('value')
      picker.and.returnValue({ a: source })
      treeView = new TreeView(tree, picker)
      expect(treeView.source().constructor.name).toEqual('Bundle')
      expect(picker).toHaveBeenCalledWith(tree)
      expect(treeView.source().pull()).toEqual({ a: 'value' })
    })

    it("picks a single source", () => {
      picker.and.returnValue(source)
      treeView = new TreeView(tree, picker)
      expect(treeView.source()).toEqual(source)
      expect(picker).toHaveBeenCalledWith(tree)
    })

  })

  describe("watching", () => {

    let pullSpy

    beforeEach(() => {
      callback = jasmine.createSpy('callback')
      spyOn(source, 'channels').and.returnValue(new Set(['things']))
      pullSpy = spyOn(source, 'pull')
      pullSpy.and.returnValue({some: 'data'})
      picker.and.returnValue(source)
      treeView = new TreeView(tree, picker, dirtyTracker)
    })

    it("calls the callback with the source's data", () => {
      treeView.watch(callback)
      dirtyTracker.markChannelDirty('things')
      dirtyTracker.flush()
      expect(callback).toHaveBeenCalledWith({some: 'data'})
    })

    it("doesn't call the callback if the channel isn't dirty", () => {
      treeView.watch(callback)
      dirtyTracker.markChannelDirty('otherChannel')
      dirtyTracker.flush()
      expect(callback).not.toHaveBeenCalled()
    })

    it("doesn't call the callback after unwatching", () => {
      treeView.watch(callback)
      treeView.unwatch()
      dirtyTracker.markChannelDirty('things')
      dirtyTracker.flush()
      expect(callback).not.toHaveBeenCalled()
    })

    it("calls the callback with fresh data", () => {
      treeView.watch(callback)
      dirtyTracker.markChannelDirty('things')
      dirtyTracker.flush()
      expect(callback).toHaveBeenCalledWith({some: 'data'})
      pullSpy.and.returnValue({someNew: 'DATA'})
      dirtyTracker.markChannelDirty('things')
      dirtyTracker.flush()
      expect(callback).toHaveBeenCalledWith({someNew: 'DATA'})
    })

  })

  describe("getting", () => {

    beforeEach(() => {
      spyOn(source, 'pull').and.returnValue({some: 'data'})
      picker.and.returnValue(source)
      treeView = new TreeView(tree, picker, dirtyTracker)
    })

    it("just returns what's pulled from the source", () => {
      expect(treeView.get()).toEqual({some: 'data'})
    })

  })

})
